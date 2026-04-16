'use client';

import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';

import Footer from '@components/Footer';
import Header from '@components/Header';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

function ContributorOnboardContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const username = searchParams.get('username');
  const error = searchParams.get('error');

  const errorMessage =
    error === 'missing_code'
      ? 'Authentication failed. Please try again.'
      : error === 'captcha_missing' || error === 'captcha_failed'
        ? 'Captcha verification failed. Please try again.'
        : error
          ? 'Something went wrong. Please try again.'
          : null;

  return (
    <section className="py-24 px-4">
      <div className="max-w-xl mx-auto text-center">
        {success ? (
          <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
            <div className="text-green-500 mb-4 flex justify-center">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re in, @{username}!</h2>
            <p className="text-gray-600">
              You can now comment on issues and pull requests in the Archestra repository.
            </p>
            <a
              href="https://github.com/archestra-ai/archestra/issues"
              className="inline-block mt-6 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Issues
            </a>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Contributor</h1>
            <p className="text-gray-600 mb-8">
              Sign in with GitHub to get access to comment on issues and pull requests in the Archestra repository.
            </p>
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}
            <form method="POST" action="/api/contributor-onboard" className="flex flex-col items-center gap-4">
              <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" />
              <button
                type="submit"
                className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Sign in with GitHub
              </button>
            </form>
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
          </div>
        )}
      </div>
    </section>
  );
}

export default function ContributorOnboardPage() {
  return (
    <>
      <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
      <Header />
      <main className="min-h-screen bg-white">
        <Suspense>
          <ContributorOnboardContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
