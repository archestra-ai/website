'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function KubeConBadge() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the badge
    const dismissed = localStorage.getItem('kubecon-badge-dismissed');
    if (!dismissed) {
      // Show badge after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('kubecon-badge-dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 animate-in slide-in-from-bottom-5 duration-500">
      <a
        href="https://calendly.com/motakuk/meet-archestra-at-kubecon-north-america-2025"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center gap-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 max-w-md"
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDismiss();
          }}
          className="absolute -top-2 -right-2 bg-white text-gray-600 rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex-shrink-0">
          <img
            src="/kcna25-white.svg"
            alt="KubeCon NA 2025"
            className="h-14 w-auto"
          />
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-semibold opacity-90">Meet us at KubeCon NA 2025</span>
          <span className="text-lg font-bold">November 10-13</span>
          <span className="text-sm opacity-90">Atlanta, Georgia</span>
          <span className="text-xs mt-1 underline group-hover:no-underline">Schedule a meeting →</span>
        </div>
      </a>
    </div>
  );
}