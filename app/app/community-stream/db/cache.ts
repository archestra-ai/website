import { asc } from 'drizzle-orm';

import { getDb } from './connection';
import { slackChannels, slackMessages, slackUsers } from './schema';

type Channel = typeof slackChannels.$inferSelect;
type Message = typeof slackMessages.$inferSelect;
type User = typeof slackUsers.$inferSelect;

interface CacheData {
  channels: Channel[];
  users: Record<string, User>;
  /** Top-level messages per channel, sorted oldest-first by ts */
  messagesByChannel: Record<string, Message[]>;
  /** Thread replies grouped by `channelId:threadTs` */
  threads: Record<string, Message[]>;
  loadedAt: number;
}

let cache: CacheData | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

async function loadFromDb(): Promise<CacheData> {
  const db = getDb();

  const [channels, userRows, allMessages] = await Promise.all([
    db.select().from(slackChannels).orderBy(asc(slackChannels.name)),
    db.select().from(slackUsers),
    db.select().from(slackMessages).orderBy(asc(slackMessages.createdAt)),
  ]);

  const users: Record<string, User> = {};
  for (const u of userRows) {
    users[u.id] = u;
  }

  const messagesByChannel: Record<string, Message[]> = {};
  const threads: Record<string, Message[]> = {};

  for (const ch of channels) {
    messagesByChannel[ch.id] = [];
  }

  for (const msg of allMessages) {
    if (msg.threadTs) {
      const key = `${msg.channelId}:${msg.threadTs}`;
      if (!threads[key]) threads[key] = [];
      threads[key].push(msg);
    } else {
      if (!messagesByChannel[msg.channelId]) messagesByChannel[msg.channelId] = [];
      messagesByChannel[msg.channelId].push(msg);
    }
  }

  return { channels, users, messagesByChannel, threads, loadedAt: Date.now() };
}

let syncTimer: ReturnType<typeof setInterval> | null = null;
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

async function backgroundSync() {
  try {
    const { runSlackSync } = await import('../scripts/slack-sync');
    await runSlackSync();
    cache = await loadFromDb();
    console.log('[sync] Background sync + cache refresh done');
  } catch (e) {
    console.error('[sync] Background sync failed:', e);
  }
}

async function getCache(): Promise<CacheData> {
  if (!cache) {
    cache = await loadFromDb();
    if (!refreshTimer) {
      refreshTimer = setInterval(async () => {
        try {
          cache = await loadFromDb();
        } catch (e) {
          console.error('Cache refresh failed:', e);
        }
      }, REFRESH_INTERVAL_MS);
      if (refreshTimer && typeof refreshTimer === 'object' && 'unref' in refreshTimer) {
        refreshTimer.unref();
      }
    }
    // Start background sync interval
    if (!syncTimer && process.env.SLACK_BOT_TOKEN) {
      syncTimer = setInterval(backgroundSync, SYNC_INTERVAL_MS);
      if (syncTimer && typeof syncTimer === 'object' && 'unref' in syncTimer) {
        syncTimer.unref();
      }
      // Run first sync after a short delay to not block startup
      setTimeout(backgroundSync, 10_000);
    }
  }
  return cache;
}

export async function refreshCache(): Promise<void> {
  cache = await loadFromDb();
}

// --- Cached query helpers ---

export async function cachedGetChannels(): Promise<Channel[]> {
  const c = await getCache();
  return c.channels;
}

export async function cachedGetUsers(): Promise<Record<string, User>> {
  const c = await getCache();
  return c.users;
}

export async function cachedGetUser(userId: string): Promise<User | null> {
  const c = await getCache();
  return c.users[userId] || null;
}

export async function cachedGetLatestMessages(channelId: string, limit = 50): Promise<Message[]> {
  const c = await getCache();
  const msgs = c.messagesByChannel[channelId] || [];
  return msgs.slice(-limit);
}

export async function cachedGetMessagesAround(channelId: string, messageTs: string, limit = 50): Promise<Message[]> {
  const c = await getCache();
  const msgs = c.messagesByChannel[channelId] || [];
  const idx = msgs.findIndex((m) => m.ts === messageTs);

  if (idx === -1) {
    // messageTs might be a thread reply, find it in all messages
    const allMsgs = c.messagesByChannel[channelId] || [];
    const threadMsgs = Object.values(c.threads).flat();
    const target = [...allMsgs, ...threadMsgs].find((m) => m.ts === messageTs);
    return target ? [target] : [];
  }

  const half = Math.floor(limit / 2);
  const start = Math.max(0, idx - half);
  const end = Math.min(msgs.length, idx + half + 1);
  return msgs.slice(start, end);
}

export async function cachedGetMessagesBefore(channelId: string, beforeTs: string, limit = 50): Promise<Message[]> {
  const c = await getCache();
  const msgs = c.messagesByChannel[channelId] || [];
  const idx = msgs.findIndex((m) => m.ts >= beforeTs);
  if (idx <= 0) return [];
  const start = Math.max(0, idx - limit);
  return msgs.slice(start, idx);
}

export async function cachedGetMessagesAfter(channelId: string, afterTs: string, limit = 50): Promise<Message[]> {
  const c = await getCache();
  const msgs = c.messagesByChannel[channelId] || [];
  const idx = msgs.findIndex((m) => m.ts > afterTs);
  if (idx === -1) return [];
  return msgs.slice(idx, idx + limit);
}

export async function cachedGetMessage(channelId: string, messageTs: string): Promise<Message | null> {
  const c = await getCache();
  const msgs = c.messagesByChannel[channelId] || [];
  const msg = msgs.find((m) => m.ts === messageTs);
  if (msg) return msg;

  // Check threads too
  const key = `${channelId}:${messageTs}`;
  const threadReplies = c.threads[key];
  if (threadReplies) {
    // The messageTs is a thread parent - should be in top-level messages
    return null;
  }

  // Search all threads for this channel
  for (const [k, replies] of Object.entries(c.threads)) {
    if (k.startsWith(channelId + ':')) {
      const found = replies.find((m) => m.ts === messageTs);
      if (found) return found;
    }
  }

  return null;
}

export async function cachedGetThreadReplies(channelId: string, threadTs: string): Promise<Message[]> {
  const c = await getCache();
  const key = `${channelId}:${threadTs}`;
  return c.threads[key] || [];
}

export async function cachedHasOlderMessages(channelId: string, oldestTs: string): Promise<boolean> {
  const c = await getCache();
  const msgs = c.messagesByChannel[channelId] || [];
  return msgs.length > 0 && msgs[0].ts < oldestTs;
}

export async function cachedHasNewerMessages(channelId: string, newestTs: string): Promise<boolean> {
  const c = await getCache();
  const msgs = c.messagesByChannel[channelId] || [];
  return msgs.length > 0 && msgs[msgs.length - 1].ts > newestTs;
}

export async function cachedGetChannelStats(): Promise<
  Record<string, { today: number; month: number; memberCount: number }>
> {
  const c = await getCache();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const stats: Record<string, { today: number; month: number; memberCount: number }> = {};

  for (const ch of c.channels) {
    const msgs = c.messagesByChannel[ch.id] || [];
    let today = 0;
    let month = 0;
    for (const m of msgs) {
      if (m.createdAt >= todayStart) today++;
      if (m.createdAt >= thirtyDaysAgo) month++;
    }
    stats[ch.name] = { today, month, memberCount: ch.memberCount || 0 };
  }

  return stats;
}

export async function cachedGetTotalTodayMessages(): Promise<number> {
  const c = await getCache();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let total = 0;
  for (const msgs of Object.values(c.messagesByChannel)) {
    for (const m of msgs) {
      if (m.createdAt >= todayStart) total++;
    }
  }
  return total;
}

export async function cachedGetTotalMemberCount(): Promise<number> {
  const c = await getCache();
  let max = 0;
  for (const ch of c.channels) {
    if ((ch.memberCount || 0) > max) max = ch.memberCount || 0;
  }
  return max;
}

export async function cachedGetMessagesByDate(channelId: string, date: string): Promise<Message[]> {
  const c = await getCache();
  const msgs = c.messagesByChannel[channelId] || [];
  const dayStart = new Date(date + 'T00:00:00.000Z');
  const dayEnd = new Date(date + 'T23:59:59.999Z');
  return msgs.filter((m) => m.createdAt >= dayStart && m.createdAt <= dayEnd);
}

export async function cachedGetAvailableDates(channelId: string): Promise<string[]> {
  const c = await getCache();
  const msgs = c.messagesByChannel[channelId] || [];
  const dateSet = new Set<string>();
  for (const m of msgs) {
    dateSet.add(m.createdAt.toISOString().slice(0, 10));
  }
  return Array.from(dateSet).sort();
}

export async function cachedGetThreadsForSitemap(): Promise<{ channelName: string; ts: string; createdAt: Date }[]> {
  const c = await getCache();
  const results: { channelName: string; ts: string; createdAt: Date }[] = [];
  const channelMap = new Map(c.channels.map((ch) => [ch.id, ch.name]));

  for (const [channelId, msgs] of Object.entries(c.messagesByChannel)) {
    const channelName = channelMap.get(channelId);
    if (!channelName) continue;
    for (const msg of msgs) {
      if ((msg.replyCount || 0) > 0) {
        results.push({ channelName, ts: msg.ts, createdAt: msg.createdAt });
      }
    }
  }

  return results;
}
