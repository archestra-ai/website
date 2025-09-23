import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';

import constants from '@constants';

import { drizzleClientHttp } from './db';
import * as schema from './schema/auth';

const {
  auth: { socialProviders, secret, baseURL },
} = constants;

export const auth = betterAuth({
  plugins: [bearer()],
  database: drizzleAdapter(drizzleClientHttp, {
    provider: 'pg',
    schema,
  }),
  socialProviders,
  secret,
  baseURL,
});
