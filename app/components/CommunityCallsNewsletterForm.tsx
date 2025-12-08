'use client';

import { FormEvent, useState } from 'react';

export default function CommunityCallsNewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Check rate limit
    const now = Date.now();
    const lastSubmit = localStorage.getItem('loops-community-form-timestamp');

    if (lastSubmit && Number(lastSubmit) + 60000 > now) {
      setErrorMessage('Too many signups, please try again in a little while');
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 3000);
      return;
    }

    localStorage.setItem('loops-community-form-timestamp', String(now));
    setStatus('loading');

    try {
      const formId = 'cmdehe4lw18tnwy0ifkz89qqk';
      
      const response = await fetch(`https://app.loops.so/api/newsletter-form/${formId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `userGroup=community&mailingLists=&email=${encodeURIComponent(email)}`,
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
      localStorage.removeItem('loops-community-form-timestamp');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  if (status === 'success') {
    return (
      <div className="relative w-full">
        <div className="relative bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <div className="text-green-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-green-800 font-medium">
              Thanks! You'll be notified about our next community call!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all placeholder-gray-400 text-sm"
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Wait...' : 'Get Notified'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-600 mt-2">{errorMessage || 'Something went wrong, please try again'}</p>
      )}
    </div>
  );
}