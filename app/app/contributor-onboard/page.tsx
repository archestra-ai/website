'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import Footer from '@components/Footer';
import Header from '@components/Header';

import OnboardWizard from './OnboardWizard';

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

  if (success) {
    return (
      <section className="py-24 px-4">
        <div className="max-w-xl mx-auto text-center">
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
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:py-24">
      <OnboardWizard initialError={errorMessage} />
    </section>
  );
}

export default function ContributorOnboardPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
        <Suspense>
          <ContributorOnboardContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
