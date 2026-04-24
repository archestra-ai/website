'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';
import { useEffect, useState } from 'react';

import { gdprConsentStore } from '@lib/gdpr-consent-store';

interface ConditionalAnalyticsProps {
  gaId: string;
}

const APOLLO_TRACKER_SCRIPT = `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");
o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,
o.onload=function(){window.trackingFunctions.onLoad({appId:"69b935fe2879d10011d83e47"})},
document.head.appendChild(o)}initApollo();`;

export default function ConditionalAnalytics({ gaId }: ConditionalAnalyticsProps) {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);
  const [hasMarketingConsent, setHasMarketingConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      setHasAnalyticsConsent(gdprConsentStore.hasAnalyticsConsent());
      setHasMarketingConsent(gdprConsentStore.hasMarketingConsent());
    };

    checkConsent();

    const unsubscribe = gdprConsentStore.subscribe(checkConsent);

    window.addEventListener('storage', checkConsent);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', checkConsent);
    };
  }, []);

  if (!hasAnalyticsConsent && !hasMarketingConsent) return null;

  return (
    <>
      {hasAnalyticsConsent ? <GoogleAnalytics gaId={gaId} /> : null}
      <Script id="apollo-website-tracker" strategy="afterInteractive">
        {APOLLO_TRACKER_SCRIPT}
      </Script>
    </>
  );
}
