'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import Footer from '@components/Footer';
import Header from '@components/Header';

import OnboardSuccess from './OnboardSuccess';
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
      <section className="py-16 px-4 sm:py-24">
        <OnboardSuccess username={username!} />
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
      <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
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
