'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function KubeConBadge() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the badge
    const dismissed = localStorage.getItem('kubecon-badge-dismissed');
    if (!dismissed) {
      // Show badge after a short delay
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('kubecon-badge-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white animate-in slide-in-from-top duration-500">
      <a
        href="https://calendly.com/motakuk/meet-archestra-at-kubecon-north-america-2025"
        target="_blank"
        rel="noopener noreferrer"
        className="block py-2 px-4 hover:bg-black/10 transition-colors"
      >
        <div className="container mx-auto flex items-center justify-center gap-2 sm:gap-4 text-center">
          <img src="/kcna25-white.svg" alt="KubeCon NA 2025" className="h-5 sm:h-6 w-auto" />
          <span className="text-xs sm:text-sm font-medium">
            Meet us at KubeCon NA 2025 • November 10-13 • Atlanta, Georgia
          </span>
          <span className="text-xs sm:text-sm underline hover:no-underline">Schedule a meeting →</span>
        </div>
      </a>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
