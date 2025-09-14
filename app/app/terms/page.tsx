import { Metadata } from 'next';

import Footer from '@components/Footer';
import Header from '@components/Header';

import TermsContent from './terms-content';

export const metadata: Metadata = {
  title: 'Terms of Service | Archestra',
  description: 'Terms of Service for Archestra - Read our terms and conditions for using our services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative">
        {/* Grid Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container relative z-10 mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <TermsContent />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
