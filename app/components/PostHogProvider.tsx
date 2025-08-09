'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

import constants from '@constants';

const {
  posthog: { token: posthogToken },
  debug,
} = constants;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!posthogToken) {
      return;
    }

    posthog.init(posthogToken!, {
      api_host: '/ingest',
      ui_host: 'https://eu.posthog.com',
      defaults: '2025-05-24',
      capture_exceptions: true, // This enables capturing exceptions using Error Tracking
      debug,
    });
  }, [posthogToken]);

  if (!posthogToken) {
    return children;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
