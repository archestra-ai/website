'use client';

import { ArrowLeft, ArrowRight, Bot, HeartHandshake, Lock, LucideIcon, PartyPopper, Sparkles } from 'lucide-react';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

const REVEAL_MS = 2500;

type Step = {
  icon: LucideIcon;
  gradient: string;
  dot: string;
  eyebrow?: string;
  title: string;
  body: { delay: number; node: React.ReactNode }[];
};

const STEPS: Step[] = [
  {
    icon: Sparkles,
    gradient: 'from-blue-500 to-blue-600',
    dot: 'bg-blue-500',
    eyebrow: 'Welcome',
    title: 'Hi, fellow contributor!',
    body: [
      {
        delay: 0,
        node: (
          <p>
            As you probably know, open source repositories are flooded with low-quality AI slop. Some people call it the{' '}
            <span className="font-semibold text-gray-900">&ldquo;End of open source&rdquo;</span>. Others close their
            repositories to external contributors.
          </p>
        ),
      },
      {
        delay: 2,
        node: (
          <p>
            We don&apos;t want to do that.{' '}
            <span className="font-semibold text-gray-900">We believe in open source.</span>
          </p>
        ),
      },
    ],
  },
  {
    icon: Lock,
    gradient: 'from-indigo-500 to-indigo-600',
    dot: 'bg-indigo-500',
    eyebrow: 'Apologies',
    title: "It'll take 60 seconds.",
    body: [
      {
        delay: 0,
        node: (
          <p>
            On the next slides we&apos;ll share a few simple rules we ask you to follow to keep the environment friendly
            for everyone.
          </p>
        ),
      },
    ],
  },
  {
    icon: Bot,
    gradient: 'from-violet-500 to-violet-600',
    dot: 'bg-violet-500',
    eyebrow: 'Rule #1',
    title: 'Use AI responsibly',
    body: [
      {
        delay: 0,
        node: (
          <p>
            There&apos;s <span className="font-semibold text-gray-900">no value</span>
            {
              ' in unrevised PRs, kilometer-long comments, or useless \u201creadiness checklists\u201d. We all have Claude.'
            }
          </p>
        ),
      },
      {
        delay: 1,
        node: (
          <p>
            There&apos;s <span className="font-semibold text-gray-900">great value</span>
            {
              ' in your critical thinking, personal judgement, and strong opinions as a user and engineer. Be crisp in communication.'
            }
          </p>
        ),
      },
      {
        delay: 2,
        node: (
          <a
            href="/docs/contributing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-base font-medium text-violet-700 underline decoration-violet-300 underline-offset-4 transition-colors hover:text-violet-900 hover:decoration-violet-500"
          >
            Read the full contributing guide
            <ArrowRight className="h-4 w-4" />
          </a>
        ),
      },
    ],
  },
  {
    icon: HeartHandshake,
    gradient: 'from-purple-500 to-purple-600',
    dot: 'bg-purple-500',
    eyebrow: 'Rule #2',
    title: 'Be respectful — especially around bounties',
    body: [
      {
        delay: 0,
        node: <p>We practice paid bounties in the repo. It&apos;s our way of saying thank you.</p>,
      },
      {
        delay: 2,
        node: (
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500" />
              Don&apos;t ask team members for bounties.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500" />
              Don&apos;t try to steal issues already assigned to someone else.
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    icon: PartyPopper,
    gradient: 'from-fuchsia-500 to-pink-600',
    dot: 'bg-fuchsia-500',
    eyebrow: 'Thank you!',
    title: 'Almost there!',
    body: [
      {
        delay: 0,
        node: (
          <p>
            On the next step, your GitHub nickname will be added to{' '}
            <a
              href="https://github.com/archestra-ai/archestra/blob/main/EXTERNAL_CONTRIBUTORS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-fuchsia-700 underline decoration-fuchsia-300 underline-offset-4 transition-colors hover:text-fuchsia-900 hover:decoration-fuchsia-500"
            >
              EXTERNAL_CONTRIBUTORS.md
            </a>{' '}
            and you&apos;ll be able to comment, open PRs, and open issues.
          </p>
        ),
      },
      {
        delay: 2,
        node: <p>Together, to a bright open-source future.</p>,
      },
    ],
  },
];

type OnboardWizardProps = {
  initialError: string | null;
};

export default function OnboardWizard({ initialError }: OnboardWizardProps) {
  const [step, setStep] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);
  const seenStepsRef = useRef<Set<number>>(new Set());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldShowError = !!initialError && !dismissedError;

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (seenStepsRef.current.has(step)) {
      setUnlocked(true);
      return;
    }

    setUnlocked(false);
    timeoutRef.current = setTimeout(() => {
      seenStepsRef.current.add(step);
      setUnlocked(true);
    }, REVEAL_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [step]);

  // Dismiss stale error banner as soon as Turnstile fires a success token.
  useEffect(() => {
    (window as unknown as { onTurnstileSuccess?: () => void }).onTurnstileSuccess = () => {
      setDismissedError(true);
    };
    return () => {
      delete (window as unknown as { onTurnstileSuccess?: () => void }).onTurnstileSuccess;
    };
  }, []);

  const current = STEPS[step];
  const Icon = current.icon;
  const isFinal = step === STEPS.length - 1;

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === step ? `w-10 ${s.dot}` : i < step ? `w-6 ${s.dot} opacity-60` : 'w-6 bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        {/* Top progress bar — only while reveal is active */}
        <div className="h-1 w-full bg-gray-100">
          {!unlocked && (
            <div
              key={`progress-${step}`}
              className={`animate-wizard-progress h-full bg-gradient-to-r ${current.gradient}`}
            />
          )}
          {unlocked && <div className={`h-full w-full bg-gradient-to-r ${current.gradient}`} />}
        </div>

        <div className="px-8 py-10 sm:px-12 sm:py-12">
          {/* Keyed wrapper so fade-ins restart on step change */}
          <div key={`slide-${step}`} className="space-y-7">
            {/* Icon */}
            <div className="reveal-item">
              <div
                className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${current.gradient} shadow-lg shadow-black/5`}
              >
                <Icon className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Heading */}
            <div className="reveal-item space-y-2">
              {current.eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">{current.eyebrow}</p>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{current.title}</h1>
            </div>

            {/* Body paragraphs */}
            <div className="reveal-item space-y-5 text-base leading-relaxed text-gray-700 sm:text-lg">
              {current.body.map((b, i) => (
                <div key={i}>{b.node}</div>
              ))}
            </div>

            {/* Error banner on final step */}
            {isFinal && shouldShowError && (
              <div className="reveal-item rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{initialError}</p>
              </div>
            )}
          </div>

          {/* Footer: back + continue / github form */}
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-4">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              <span className="text-sm text-gray-400">
                Step {step + 1} of {STEPS.length}
              </span>
            </div>

            {isFinal ? (
              <form
                key={`form-${step}`}
                method="POST"
                action="/api/contributor-onboard"
                className="reveal-item flex flex-col items-end gap-3"
              >
                <div
                  className="cf-turnstile"
                  data-sitekey={TURNSTILE_SITE_KEY}
                  data-theme="light"
                  data-callback="onTurnstileSuccess"
                />
                <button
                  type="submit"
                  disabled={!unlocked || shouldShowError}
                  className={`inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 ${
                    shouldShowError ? 'hidden' : ''
                  }`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Sign in with GitHub
                </button>
                <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
              </form>
            ) : (
              <button
                key={`next-${step}`}
                type="button"
                disabled={!unlocked}
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className={`reveal-item inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${current.gradient} px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-sm`}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-gray-400">
        Take a moment to read each step — this gate is here so that the repo stays a good place for everyone.
      </p>
    </div>
  );
}
