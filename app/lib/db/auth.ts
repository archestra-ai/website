import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { drizzleClientHttp } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(drizzleClientHttp, {
    provider: 'pg',
  }),
});
