'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import { useEffect, useState } from 'react';

import { gdprConsentStore } from '@lib/gdpr-consent-store';

interface ConditionalAnalyticsProps {
  gaId: string;
}

export default function ConditionalAnalytics({ gaId }: ConditionalAnalyticsProps) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      setHasConsent(gdprConsentStore.hasAnalyticsConsent());
    };

    checkConsent();

    const unsubscribe = gdprConsentStore.subscribe(checkConsent);

    window.addEventListener('storage', checkConsent);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', checkConsent);
    };
  }, []);

  if (!hasConsent) return null;

  return <GoogleAnalytics gaId={gaId} />;
}
