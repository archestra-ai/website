import { and, asc, count, desc, eq, gt, gte, isNull, lt, sql } from 'drizzle-orm';

import { getDb } from './connection';
import { slackChannels, slackMessages, slackUsers } from './schema';

const PAGE_SIZE = 50;

export async function getChannels() {
  const db = getDb();
  return db.select().from(slackChannels).orderBy(asc(slackChannels.name));
}

export async function getUsers() {
  const db = getDb();
  const rows = await db.select().from(slackUsers);
  const map: Record<string, typeof rows[0]> = {};
  for (const row of rows) {
    map[row.id] = row;
  }
  return map;
}

export async function getLatestMessages(channelId: string, limit = PAGE_SIZE) {
  const db = getDb();
  const rows = await db
    .select()
    .from(slackMessages)
    .where(and(eq(slackMessages.channelId, channelId), isNull(slackMessages.threadTs)))
    .orderBy(desc(slackMessages.createdAt))
    .limit(limit);
  return rows.reverse();
}

export async function getMessagesAround(channelId: string, messageTs: string, limit = PAGE_SIZE) {
  const db = getDb();
  const half = Math.floor(limit / 2);

  const before = await db
    .select()
    .from(slackMessages)
    .where(and(eq(slackMessages.channelId, channelId), isNull(slackMessages.threadTs), lt(slackMessages.ts, messageTs)))
    .orderBy(desc(slackMessages.createdAt))
    .limit(half);

  const target = await db
    .select()
    .from(slackMessages)
    .where(and(eq(slackMessages.channelId, channelId), eq(slackMessages.ts, messageTs)))
    .limit(1);

  const after = await db
    .select()
    .from(slackMessages)
    .where(and(eq(slackMessages.channelId, channelId), isNull(slackMessages.threadTs), gt(slackMessages.ts, messageTs)))
    .orderBy(asc(slackMessages.createdAt))
    .limit(half);

  return [...before.reverse(), ...target, ...after];
}

export async function getMessagesBefore(channelId: string, beforeTs: string, limit = PAGE_SIZE) {
  const db = getDb();
  const rows = await db
    .select()
    .from(slackMessages)
    .where(and(eq(slackMessages.channelId, channelId), isNull(slackMessages.threadTs), lt(slackMessages.ts, beforeTs)))
    .orderBy(desc(slackMessages.createdAt))
    .limit(limit);
  return rows.reverse();
}

export async function getMessagesAfter(channelId: string, afterTs: string, limit = PAGE_SIZE) {
  const db = getDb();
  return db
    .select()
    .from(slackMessages)
    .where(and(eq(slackMessages.channelId, channelId), isNull(slackMessages.threadTs), gt(slackMessages.ts, afterTs)))
    .orderBy(asc(slackMessages.createdAt))
    .limit(limit);
}

export async function getMessage(channelId: string, messageTs: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(slackMessages)
    .where(and(eq(slackMessages.channelId, channelId), eq(slackMessages.ts, messageTs)))
    .limit(1);
  return row || null;
}

export async function getMessageById(messageId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(slackMessages)
    .where(eq(slackMessages.id, messageId))
    .limit(1);
  return row || null;
}

export async function getThreadReplies(channelId: string, threadTs: string) {
  const db = getDb();
  return db
    .select()
    .from(slackMessages)
    .where(and(eq(slackMessages.channelId, channelId), eq(slackMessages.threadTs, threadTs)))
    .orderBy(asc(slackMessages.createdAt));
}

export async function getChannelStats() {
  const db = getDb();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const channels = await db.select().from(slackChannels);
  const stats: Record<string, { today: number; month: number; memberCount: number }> = {};

  for (const ch of channels) {
    const [todayResult] = await db
      .select({ count: count() })
      .from(slackMessages)
      .where(and(eq(slackMessages.channelId, ch.id), isNull(slackMessages.threadTs), gte(slackMessages.createdAt, todayStart)));

    const [monthResult] = await db
      .select({ count: count() })
      .from(slackMessages)
      .where(and(eq(slackMessages.channelId, ch.id), isNull(slackMessages.threadTs), gte(slackMessages.createdAt, thirtyDaysAgo)));

    stats[ch.name] = {
      today: todayResult?.count || 0,
      month: monthResult?.count || 0,
      memberCount: ch.memberCount || 0,
    };
  }

  return stats;
}

export async function getTotalTodayMessages() {
  const db = getDb();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({ count: count() })
    .from(slackMessages)
    .where(and(isNull(slackMessages.threadTs), gte(slackMessages.createdAt, todayStart)));

  return result?.count || 0;
}

export async function getTotalMemberCount() {
  const db = getDb();
  const [result] = await db
    .select({ total: sql<number>`COALESCE(MAX(${slackChannels.memberCount}), 0)` })
    .from(slackChannels);
  return result?.total || 0;
}

export async function hasOlderMessages(channelId: string, oldestTs: string) {
  const db = getDb();
  const [result] = await db
    .select({ count: count() })
    .from(slackMessages)
    .where(and(eq(slackMessages.channelId, channelId), isNull(slackMessages.threadTs), lt(slackMessages.ts, oldestTs)));
  return (result?.count || 0) > 0;
}

export async function hasNewerMessages(channelId: string, newestTs: string) {
  const db = getDb();
  const [result] = await db
    .select({ count: count() })
    .from(slackMessages)
    .where(and(eq(slackMessages.channelId, channelId), isNull(slackMessages.threadTs), gt(slackMessages.ts, newestTs)));
  return (result?.count || 0) > 0;
}

export async function getUser(userId: string) {
  const db = getDb();
  const [row] = await db.select().from(slackUsers).where(eq(slackUsers.id, userId)).limit(1);
  return row || null;
}
