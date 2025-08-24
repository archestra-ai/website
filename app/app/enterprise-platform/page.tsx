'use client';

import Script from 'next/script';
import Footer from '@components/Footer';
import Header from '@components/Header';
import { Badge } from '@components/ui/badge';

export default function EnterprisePlatformPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Enterprise Solution</Badge>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Archestra Enterprise Multi-Tenant MCP Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Deploy and manage AI agents at scale with enterprise-grade security, compliance, and governance. 
              Built for organizations that need complete control over their AI infrastructure.
            </p>
          </div>
        </section>

        {/* Calendly inline widget */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div 
              className="calendly-inline-widget" 
              data-url="https://calendly.com/d/cswr-dwp-tsr/archestra-enterprise-demo"
              style={{ minWidth: '320px', height: '1100px' }}
            />
            <Script 
              type="text/javascript"
              src="https://assets.calendly.com/assets/external/widget.js"
              async
            />
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}