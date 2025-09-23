import { integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const tokenUsageTable = pgTable(
  'token_usage',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    date: text('date').notNull(), // Format: YYYY-MM-DD
    tokensUsed: integer('tokens_used').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userDateIdx: uniqueIndex('user_date_idx').on(table.userId, table.date),
  })
);

export type TokenUsage = typeof tokenUsageTable.$inferSelect;
export type NewTokenUsage = typeof tokenUsageTable.$inferInsert;
