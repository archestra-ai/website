'use client';

import { gdprConsentStore } from '@lib/gdpr-consent-store';

export default function CookieSettingsLink() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    gdprConsentStore.openPanel();
  };

  return (
    <button
      onClick={handleClick}
      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
    >
      Cookie Settings
    </button>
  );
}
