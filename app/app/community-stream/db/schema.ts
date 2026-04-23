import { index, integer, jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const slackUsers = pgTable('slack_users', {
  id: varchar('id', { length: 32 }).primaryKey(),
  displayName: text('display_name').notNull(),
  realName: text('real_name'),
  avatarUrl: text('avatar_url'),
  avatarColor: varchar('avatar_color', { length: 7 }),
  isBot: integer('is_bot').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const slackChannels = pgTable('slack_channels', {
  id: varchar('id', { length: 32 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  topic: text('topic'),
  purpose: text('purpose'),
  memberCount: integer('member_count').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const slackMessages = pgTable(
  'slack_messages',
  {
    id: varchar('id', { length: 64 }).primaryKey(), // channelId:ts
    channelId: varchar('channel_id', { length: 32 }).notNull(),
    userId: varchar('user_id', { length: 32 }),
    ts: varchar('ts', { length: 32 }).notNull(), // Slack message timestamp (unique ID)
    threadTs: varchar('thread_ts', { length: 32 }), // parent thread ts, null if not a reply
    text: text('text').notNull(),
    replyCount: integer('reply_count').default(0),
    replyUsersCount: integer('reply_users_count').default(0),
    reactions: jsonb('reactions').$type<{ name: string; count: number; users: string[] }[]>(),
    files: jsonb('files').$type<{ name: string; mimetype: string; url: string }[]>(),
    slackUrl: text('slack_url'),
    createdAt: timestamp('created_at').notNull(),
    syncedAt: timestamp('synced_at').defaultNow(),
  },
  (table) => [
    index('idx_messages_channel_created').on(table.channelId, table.createdAt),
    index('idx_messages_thread').on(table.channelId, table.threadTs),
  ]
);

export const syncState = pgTable('sync_state', {
  channelId: varchar('channel_id', { length: 32 }).primaryKey(),
  oldestTs: varchar('oldest_ts', { length: 32 }), // oldest message ts we've fetched
  newestTs: varchar('newest_ts', { length: 32 }), // newest message ts we've fetched
  updatedAt: timestamp('updated_at').defaultNow(),
});
