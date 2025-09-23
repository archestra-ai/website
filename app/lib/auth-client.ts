import { createAuthClient } from 'better-auth/react';

import constants from '@constants';

export const authClient = createAuthClient({
  baseURL: constants.auth.baseURL,
});
