# Working with DB

## Basic commands

```bash
cd app

pnpm db:studio # run Drizzle studio
pnpm db:generate # generate migrations
pnpm db:migrate # apply migrations
```

## Create better-auth schema

```bash
cd app
npx @better-auth/cli generate --config ./lib/db/auth.ts --output ./lib/db/schema/auth.ts
```
