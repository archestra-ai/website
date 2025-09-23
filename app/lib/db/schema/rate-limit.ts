import { integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const rateLimitTable = pgTable(
  'rate_limit',
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

export type RateLimit = typeof rateLimitTable.$inferSelect;
export type NewRateLimit = typeof rateLimitTable.$inferInsert;
