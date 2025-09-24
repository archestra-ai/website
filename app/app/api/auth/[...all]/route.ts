import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@lib/db/auth';

export const { POST, GET } = toNextJsHandler(auth);
