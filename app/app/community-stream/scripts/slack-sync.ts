import { WebClient } from '@slack/web-api';
import { eq } from 'drizzle-orm';

import { getDb } from '../db/connection';
import { slackChannels, slackMessages, slackUsers, syncState } from '../db/schema';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface LocalFile {
  name: string;
  mimetype: string;
  url: string;
}

function extractFiles(msgFiles: any[]): LocalFile[] {
  return msgFiles
    .filter((f: any) => !f.mode || f.mode !== 'tombstone')
    .map((f: any) => ({
      name: f.name || 'file',
      mimetype: f.mimetype || '',
      url: f.permalink || '',
    }));
}

function makeMessageId(channelId: string, ts: string): string {
  return `${channelId}:${ts}`;
}

function tsToDate(ts: string): Date {
  return new Date(parseFloat(ts) * 1000);
}

function buildSlackUrl(channelId: string, ts: string, threadTs?: string): string {
  const base = `https://archestracommunity.slack.com/archives/${channelId}/p${ts.replace('.', '')}`;
  if (threadTs && threadTs !== ts) {
    return `${base}?thread_ts=${threadTs}&cid=${channelId}`;
  }
  return base;
}

async function syncUsers(slack: WebClient, db: ReturnType<typeof getDb>) {
  console.log('Syncing users...');
  let cursor: string | undefined;
  let total = 0;

  const colors = [
    '#2BAC76',
    '#E8912D',
    '#4A90D9',
    '#9B59B6',
    '#E74C3C',
    '#1ABC9C',
    '#E91E63',
    '#607D8B',
    '#FF6B35',
    '#3D5A80',
  ];

  do {
    const result = await slack.users.list({ cursor, limit: 200 });
    const members = result.members || [];

    const batch = members
      .filter((m) => !m.deleted && m.id)
      .map((member) => {
        const displayName = member.profile?.display_name || member.profile?.real_name || member.name || 'Unknown';
        const hash = member.id!.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
        return {
          id: member.id!,
          displayName,
          realName: member.profile?.real_name || null,
          avatarUrl: member.profile?.image_72 || null,
          avatarColor: colors[hash % colors.length],
          isBot: member.is_bot ? 1 : 0,
          updatedAt: new Date(),
        };
      });

    for (let i = 0; i < batch.length; i += 50) {
      const chunk = batch.slice(i, i + 50);
      await Promise.all(
        chunk.map((user) =>
          db
            .insert(slackUsers)
            .values(user)
            .onConflictDoUpdate({
              target: slackUsers.id,
              set: {
                displayName: user.displayName,
                realName: user.realName,
                avatarUrl: user.avatarUrl,
                avatarColor: user.avatarColor,
                isBot: user.isBot,
                updatedAt: user.updatedAt,
              },
            })
        )
      );
      total += chunk.length;
    }

    cursor = result.response_metadata?.next_cursor || undefined;
  } while (cursor);

  console.log(`  Synced ${total} users`);
}

async function syncChannelInfo(slack: WebClient, db: ReturnType<typeof getDb>, channels: Record<string, string>) {
  for (const [name, channelId] of Object.entries(channels)) {
    const info = await slack.conversations.info({ channel: channelId });
    const ch = info.channel;
    if (!ch) continue;

    let memberCount = 0;
    try {
      const membersResult = await slack.conversations.members({ channel: channelId, limit: 1 });
      memberCount = membersResult.members?.length || 0;
      if (membersResult.response_metadata?.next_cursor) {
        let cursor: string | undefined = membersResult.response_metadata.next_cursor;
        while (cursor) {
          const page = await slack.conversations.members({ channel: channelId, limit: 200, cursor });
          memberCount += page.members?.length || 0;
          cursor = page.response_metadata?.next_cursor || undefined;
        }
      }
    } catch {
      // not critical
    }

    await db
      .insert(slackChannels)
      .values({
        id: channelId,
        name,
        topic: ch.topic?.value || null,
        purpose: ch.purpose?.value || null,
        memberCount,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: slackChannels.id,
        set: {
          name,
          topic: ch.topic?.value || null,
          purpose: ch.purpose?.value || null,
          memberCount,
          updatedAt: new Date(),
        },
      });
  }
}

async function syncChannelMessages(
  slack: WebClient,
  db: ReturnType<typeof getDb>,
  channelName: string,
  channelId: string
) {
  const [state] = await db.select().from(syncState).where(eq(syncState.channelId, channelId));

  let totalNew = 0;
  if (state?.newestTs) {
    totalNew += await fetchMessages(slack, db, channelId, { oldest: state.newestTs });
  } else {
    totalNew += await fetchMessages(slack, db, channelId, {});
  }

  console.log(`  Synced ${totalNew} new messages for #${channelName}`);
}

async function fetchMessages(
  slack: WebClient,
  db: ReturnType<typeof getDb>,
  channelId: string,
  opts: { oldest?: string; latest?: string }
): Promise<number> {
  let cursor: string | undefined;
  let total = 0;
  let newestTs: string | undefined;
  let oldestTs: string | undefined;

  do {
    const result = await slack.conversations.history({
      channel: channelId,
      oldest: opts.oldest,
      latest: opts.latest,
      limit: 200,
      cursor,
    });

    const messages = result.messages || [];
    const validMsgs = messages.filter(
      (msg) => msg.ts && msg.subtype !== 'channel_join' && msg.subtype !== 'channel_leave'
    );

    for (let i = 0; i < validMsgs.length; i += 50) {
      const chunk = validMsgs.slice(i, i + 50);
      await Promise.all(
        chunk.map((msg) => {
          const id = makeMessageId(channelId, msg.ts!);
          const reactions = (msg.reactions || []).map((r) => ({
            name: r.name || '',
            count: r.count || 0,
            users: r.users || [],
          }));
          const files = msg.files ? extractFiles(msg.files) : [];
          return db
            .insert(slackMessages)
            .values({
              id,
              channelId,
              userId: msg.user || msg.bot_id || null,
              ts: msg.ts!,
              threadTs: msg.thread_ts && msg.thread_ts !== msg.ts ? msg.thread_ts : null,
              text: msg.text || '',
              replyCount: msg.reply_count || 0,
              replyUsersCount: msg.reply_users_count || 0,
              reactions,
              files: files.length > 0 ? files : null,
              slackUrl: buildSlackUrl(channelId, msg.ts!),
              createdAt: tsToDate(msg.ts!),
              syncedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: slackMessages.id,
              set: {
                text: msg.text || '',
                replyCount: msg.reply_count || 0,
                replyUsersCount: msg.reply_users_count || 0,
                reactions,
                files: files.length > 0 ? files : null,
                syncedAt: new Date(),
              },
            });
        })
      );
    }

    for (const msg of validMsgs) {
      if (!newestTs || msg.ts! > newestTs) newestTs = msg.ts!;
      if (!oldestTs || msg.ts! < oldestTs) oldestTs = msg.ts!;

      if (msg.reply_count && msg.reply_count > 0) {
        await fetchThreadReplies(slack, db, channelId, msg.ts!);
      }
      total++;
    }

    cursor = result.response_metadata?.next_cursor || undefined;
    if (cursor) await sleep(500);
  } while (cursor);

  if (newestTs) {
    const [existing] = await db.select().from(syncState).where(eq(syncState.channelId, channelId));
    if (existing) {
      await db
        .update(syncState)
        .set({
          newestTs: !existing.newestTs || newestTs > existing.newestTs ? newestTs : existing.newestTs,
          oldestTs: !existing.oldestTs || (oldestTs && oldestTs < existing.oldestTs) ? oldestTs : existing.oldestTs,
          updatedAt: new Date(),
        })
        .where(eq(syncState.channelId, channelId));
    } else {
      await db.insert(syncState).values({ channelId, newestTs, oldestTs, updatedAt: new Date() });
    }
  }

  return total;
}

async function fetchThreadReplies(
  slack: WebClient,
  db: ReturnType<typeof getDb>,
  channelId: string,
  threadTs: string
): Promise<number> {
  let cursor: string | undefined;
  let count = 0;

  do {
    const result = await slack.conversations.replies({ channel: channelId, ts: threadTs, limit: 200, cursor });
    const messages = result.messages || [];
    const replies = messages.filter((msg) => msg.ts && msg.ts !== threadTs);

    await Promise.all(
      replies.map((msg) => {
        const id = makeMessageId(channelId, msg.ts!);
        const reactions = (msg.reactions || []).map((r) => ({
          name: r.name || '',
          count: r.count || 0,
          users: r.users || [],
        }));
        const files = msg.files ? extractFiles(msg.files) : [];
        return db
          .insert(slackMessages)
          .values({
            id,
            channelId,
            userId: msg.user || msg.bot_id || null,
            ts: msg.ts!,
            threadTs,
            text: msg.text || '',
            replyCount: 0,
            replyUsersCount: 0,
            reactions,
            files: files.length > 0 ? files : null,
            slackUrl: buildSlackUrl(channelId, msg.ts!, threadTs),
            createdAt: tsToDate(msg.ts!),
            syncedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: slackMessages.id,
            set: { text: msg.text || '', reactions, files: files.length > 0 ? files : null, syncedAt: new Date() },
          });
      })
    );
    count += replies.length;

    cursor = result.response_metadata?.next_cursor || undefined;
  } while (cursor);

  return count;
}

/** Run a full incremental Slack sync. Importable from other modules. */
export async function runSlackSync(): Promise<void> {
  const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
  const db = getDb();
  const channels = {
    general: process.env.SLACK_CHANNEL_GENERAL!,
    social: process.env.SLACK_CHANNEL_SOCIAL!,
    development: process.env.SLACK_CHANNEL_DEVELOPMENT!,
  };

  console.log('Starting Slack sync...');
  await syncUsers(slack, db);
  await syncChannelInfo(slack, db, channels);
  for (const [name, channelId] of Object.entries(channels)) {
    await syncChannelMessages(slack, db, name, channelId);
  }
  console.log('Sync complete!');
}

// Run directly when executed as a script
const isDirectRun = process.argv[1]?.includes('slack-sync');
if (isDirectRun) {
  import('dotenv/config').then(() =>
    runSlackSync().catch((err) => {
      console.error('Sync failed:', err);
      process.exit(1);
    })
  );
}
