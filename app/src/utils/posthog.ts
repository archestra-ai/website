import { PostHog } from 'posthog-node';

import constants from '@constants';

const {
  posthog: { token: posthogToken, host: posthogHost },
} = constants;

/**
 * NOTE: This is a Node.js client, so you can use it for sending events from the server side to PostHog.
 * https://posthog.com/docs/libraries/node
 */
export default function PostHogClient() {
  const posthogClient = new PostHog(posthogToken!, {
    host: posthogHost,
    flushAt: 1,
    flushInterval: 0,
  });

  return posthogClient;
}
