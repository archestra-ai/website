import { defineConfig } from 'drizzle-kit';

import constants from './constants';

export default defineConfig({
  out: './lib/db/migrations',
  schema: './lib/db/schema',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: constants.database.url,
  },
});
