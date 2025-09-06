interface Window {
  gtag?: (
    command: 'consent' | 'config' | 'event',
    targetId: string | { [key: string]: string },
    config?: { [key: string]: any }
  ) => void;
}
