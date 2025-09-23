import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import constants from '@constants';

import { drizzleClientHttp } from './db';
import * as schema from './schema/auth';

const {
  auth: { socialProviders, secret, baseURL },
} = constants;

export const auth = betterAuth({
  database: drizzleAdapter(drizzleClientHttp, {
    provider: 'pg',
    schema,
  }),
  socialProviders,
  secret,
  baseURL,
  // https://www.better-auth.com/docs/reference/options#wildcard-support
  trustedOrigins: ['archestra-ai://auth-success'],
});
