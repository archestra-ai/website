export const CONSENT_STORAGE_KEY = 'gdpr-consent';
export const CONSENT_VERSION = '1.0';

export interface ConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface StoredConsent {
  version: string;
  timestamp: string;
  settings: ConsentSettings;
}

let listeners: Array<() => void> = [];

export const gdprConsentStore = {
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  openPanel() {
    listeners.forEach((listener) => listener());
  },

  getConsent(): StoredConsent | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  hasConsent(): boolean {
    const consent = this.getConsent();
    return consent !== null && consent.version === CONSENT_VERSION;
  },

  hasAnalyticsConsent(): boolean {
    const consent = this.getConsent();
    return consent?.settings?.analytics === true;
  },

  hasMarketingConsent(): boolean {
    const consent = this.getConsent();
    return consent?.settings?.marketing === true;
  },

  hasPreferencesConsent(): boolean {
    const consent = this.getConsent();
    return consent?.settings?.preferences === true;
  },
};
