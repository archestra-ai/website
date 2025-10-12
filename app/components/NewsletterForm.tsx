'use client';

import { useState, FormEvent } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Check rate limit
    const now = Date.now();
    const lastSubmit = localStorage.getItem('loops-form-timestamp');
    
    if (lastSubmit && Number(lastSubmit) + 60000 > now) {
      setErrorMessage('Too many signups, please try again in a little while');
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 3000);
      return;
    }
    
    localStorage.setItem('loops-form-timestamp', String(now));
    setStatus('loading');

    try {
      const response = await fetch('https://app.loops.so/api/newsletter-form/cmdehe4lw18tnwy0ifkz89qqk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `userGroup=&mailingLists=&email=${encodeURIComponent(email)}`,
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Something went wrong');
        setStatus('error');
        setTimeout(() => {
          setStatus('idle');
          setErrorMessage('');
        }, 5000);
      }
    } catch (error) {
      if ((error as Error).message === 'Failed to fetch') {
        setErrorMessage('Too many signups, please try again in a little while');
      } else {
        setErrorMessage('Something went wrong, please try again');
      }
      setStatus('error');
      localStorage.removeItem('loops-form-timestamp');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  if (status === 'success') {
    return (
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
        <div className="relative bg-white p-8 rounded-xl shadow-xl border border-gray-100">
          <div className="flex flex-col items-center justify-center">
            <div className="text-green-500 mb-2">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg text-gray-800 font-medium">
              Thanks! We'll be in touch!
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          No spam, unsubscribe at any time. We respect your privacy.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
      <form 
        className="relative bg-white p-2 rounded-xl shadow-xl border border-gray-100"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            className="flex-1 px-5 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all placeholder-gray-400"
            type="email" 
            placeholder="Enter your email address" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
          />
          <button 
            type="submit" 
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Please wait...' : 'Get Updates ✨'}
          </button>
        </div>
      </form>
      {status === 'error' && (
        <div className="flex items-center justify-center py-4">
          <p className="text-sm text-red-600">
            {errorMessage || 'Oops! Something went wrong, please try again'}
          </p>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-4 text-center">
        No spam, unsubscribe at any time. We respect your privacy.
      </p>
    </div>
  );
}