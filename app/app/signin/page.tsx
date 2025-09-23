'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import Footer from '@components/Footer';
import Header from '@components/Header';
import { authClient } from '@lib/auth-client';

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const triggerOAuth = async () => {
      try {
        await authClient.signIn.social({
          provider: 'google',
          // Get callbackURL from query params, default to '/'
          // TODO: we need to put the proper token here...
          callbackURL: `${searchParams.get('callbackURL')}?token=12345` || '/',
        });
      } catch (err) {
        console.error('OAuth error:', err);
        setError('Failed to start authentication. Please try again.');
      }
    };

    triggerOAuth();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h1 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h1>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Signing you in...</h1>
            <p className="text-gray-600">Redirecting to Google for authentication.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
