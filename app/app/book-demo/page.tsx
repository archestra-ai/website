'use client';

import Script from 'next/script';
import { useState } from 'react';

import Footer from '@components/Footer';
import Header from '@components/Header';

export default function BookDemoPage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Calendly inline widget */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Loading spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="mt-4 text-gray-600">Loading scheduling widget...</p>
                  </div>
                </div>
              )}
              <div
                className="calendly-inline-widget"
                data-url="https://calendly.com/d/cswr-dwp-tsr/archestra-enterprise-demo"
                style={{ minWidth: '320px', height: '1100px' }}
                onLoad={() => setIsLoading(false)}
              />
            </div>
            <Script
              type="text/javascript"
              src="https://assets.calendly.com/assets/external/widget.js"
              async
              onLoad={() => {
                // Give Calendly a moment to fully initialize
                setTimeout(() => setIsLoading(false), 1000);
              }}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
