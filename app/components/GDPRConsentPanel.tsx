'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { CONSENT_STORAGE_KEY, CONSENT_VERSION, ConsentSettings, gdprConsentStore } from '@lib/gdpr-consent-store';

export default function GDPRConsentPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [isManuallyOpened, setIsManuallyOpened] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!storedConsent) {
      setIsVisible(true);
    } else {
      try {
        const parsed = JSON.parse(storedConsent);
        if (parsed.version !== CONSENT_VERSION) {
          setIsVisible(true);
        }
      } catch {
        setIsVisible(true);
      }
    }

    const unsubscribe = gdprConsentStore.subscribe(() => {
      setIsVisible(true);
      setIsManuallyOpened(true);
    });

    return unsubscribe;
  }, []);

  const handleAcceptAll = () => {
    const allConsent: ConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allConsent);
  };

  const handleRejectAll = () => {
    const minimalConsent: ConsentSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsent(minimalConsent);
  };

  const saveConsent = (settings: ConsentSettings) => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString(),
        settings,
      })
    );
    setIsVisible(false);
    setIsManuallyOpened(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    setIsManuallyOpened(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6 relative">
          {isManuallyOpened && (
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                We use cookies to enhance your browsing experience and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Only Necessary
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}