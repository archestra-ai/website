DROP INDEX "user_date_idx";--> statement-breakpoint
ALTER TABLE "token_usage" ADD COLUMN "chat_id" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "user_date_chat_idx" ON "token_usage" USING btree ("user_id","date","chat_id");