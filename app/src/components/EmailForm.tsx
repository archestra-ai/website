'use client';

import Head from 'next/head';
import React, { useRef, useState } from 'react';

export function EmailForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'rate-limited'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('Oops! Something went wrong, please try again');
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formInput = inputRef.current;
    if (!formInput) return;

    // Rate limiting: 1 min between signups
    const timestamp = Date.now();
    const previousTimestamp = localStorage.getItem('loops-form-timestamp');
    if (previousTimestamp && Number(previousTimestamp) + 60000 > timestamp) {
      setStatus('rate-limited');
      setErrorMessage('Too many signups, please try again in a little while');
      return;
    }
    localStorage.setItem('loops-form-timestamp', String(timestamp));

    setStatus('loading');
    setErrorMessage('Oops! Something went wrong, please try again');

    const formBody = 'userGroup=&mailingLists=&email=' + encodeURIComponent(formInput.value);

    try {
      const res = await fetch('https://app.loops.so/api/newsletter-form/cmdehe4lw18tnwy0ifkz89qqk', {
        method: 'POST',
        body: formBody,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        formRef.current?.reset();
      } else {
        setStatus('error');
        setErrorMessage(data.message || res.statusText);
      }
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        setStatus('rate-limited');
        setErrorMessage('Too many signups, please try again in a little while');
        return;
      }
      setStatus('error');
      setErrorMessage(error.message || 'Oops! Something went wrong, please try again');
      localStorage.setItem('loops-form-timestamp', '');
    }
  };

  const handleBack = () => {
    setStatus('idle');
    setErrorMessage('Oops! Something went wrong, please try again');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter&family=Roboto&display=swap" rel="stylesheet" />
      </Head>
      <div className="w-full">
        <div
          className="newsletter-form-container"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%' }}
        >
          {(status === 'idle' || status === 'loading') && (
            <form
              ref={formRef}
              className="newsletter-form"
              action="https://app.loops.so/api/newsletter-form/cmdehe4lw18tnwy0ifkz89qqk"
              method="POST"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'center',
                width: '100%',
              }}
              onSubmit={handleSubmit}
            >
              <input
                className="newsletter-form-input"
                name="newsletter-form-input"
                type="email"
                placeholder="you@example.com"
                required
                ref={inputRef}
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  color: '#000',
                  fontSize: 14,
                  margin: '0 0 10px',
                  width: '100%',
                  minWidth: 100,
                  background: '#fff',
                  border: '1px solid #d1d5db',
                  boxSizing: 'border-box',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  display: status === 'loading' ? 'none' : 'flex',
                  textAlign: 'center',
                }}
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                className="newsletter-form-button"
                style={{
                  background: status === 'loading' ? '#0d9488' : '#000',
                  fontSize: 15,
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  letterSpacing: 1,
                  display: status === 'loading' ? 'none' : 'flex',
                  width: '100%',
                  whiteSpace: 'normal',
                  height: 42,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  padding: '10px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontStyle: 'normal',
                  lineHeight: '22px',
                  border: '2px solid #000',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                }}
                disabled={status === 'loading'}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#000';
                  e.currentTarget.style.border = '2px solid #000';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#000';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.border = '2px solid #000';
                }}
              >
                Get notified on launch
              </button>
              <button
                type="button"
                className="newsletter-loading-button"
                style={{
                  background: '#0d9488',
                  fontSize: 14,
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  display: status === 'loading' ? 'flex' : 'none',
                  width: '100%',
                  whiteSpace: 'normal',
                  height: 38,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  padding: '9px 17px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  borderRadius: 6,
                  textAlign: 'center',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '20px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                disabled
              >
                Please wait...
              </button>
            </form>
          )}
          {status === 'success' && (
            <div
              className="newsletter-success"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
            >
              <p
                className="newsletter-success-message"
                style={{ fontFamily: 'Inter, sans-serif', color: '#000', fontSize: 14 }}
              >
                Thanks! We'll be in touch!
              </p>
            </div>
          )}
          {(status === 'error' || status === 'rate-limited') && (
            <div
              className="newsletter-error"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
            >
              <p
                className="newsletter-error-message"
                style={{ fontFamily: 'Inter, sans-serif', color: '#b91c1c', fontSize: 14 }}
              >
                {errorMessage}
              </p>
            </div>
          )}
          {(status === 'error' || status === 'rate-limited' || status === 'success') && (
            <button
              className="newsletter-back-button"
              type="button"
              style={{
                color: '#6b7280',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                margin: '10px auto',
                textAlign: 'center',
                display: 'block',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
              onClick={handleBack}
              onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              &larr; Back
            </button>
          )}
        </div>
      </div>
    </>
  );
}
