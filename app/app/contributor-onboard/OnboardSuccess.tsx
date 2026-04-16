'use client';

import {
  Check,
  ExternalLink,
  GitPullRequest,
  Loader2,
  LucideIcon,
  PartyPopper,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type TimelineStep = {
  label: string;
  icon: LucideIcon;
  doneAt: number;
};

const STEPS: TimelineStep[] = [
  { label: 'GitHub verified', icon: ShieldCheck, doneAt: 0 },
  { label: 'Added your handle to EXTERNAL_CONTRIBUTORS.md', icon: UserPlus, doneAt: 3 },
  { label: 'Pull request opened', icon: GitPullRequest, doneAt: 6 },
  { label: 'Auto-merging to `main`', icon: Loader2, doneAt: 30 },
  { label: 'You can now create PRs, open issues, and comment \u{1F389}', icon: PartyPopper, doneAt: 30 },
];

const TOTAL_DURATION = 30;

type OnboardSuccessProps = {
  username: string;
};

export default function OnboardSuccess({ username }: OnboardSuccessProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const next = (Date.now() - start) / 1000;
      setElapsed(next);
      if (next >= TOTAL_DURATION + 0.5) {
        clearInterval(id);
      }
    }, 100);

    return () => clearInterval(id);
  }, []);

  const complete = elapsed >= TOTAL_DURATION;
  const progressPct = Math.min(100, (elapsed / TOTAL_DURATION) * 100);

  const stepState = (index: number): 'pending' | 'in-progress' | 'done' => {
    const step = STEPS[index];
    if (elapsed >= step.doneAt) return 'done';
    const prevDoneAt = index === 0 ? 0 : STEPS[index - 1].doneAt;
    if (elapsed >= prevDoneAt) return 'in-progress';
    return 'pending';
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        {/* Top progress bar */}
        <div className="h-1 w-full bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-600 transition-[width] duration-100 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="px-8 py-10 sm:px-12 sm:py-12">
          {/* Header */}
          <div className="space-y-5">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg shadow-black/5">
              <PartyPopper className="h-8 w-8 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {complete ? `You're in, @${username}!` : 'Adding you to the contributors list'}
            </h1>
          </div>

          {/* Timeline */}
          <div className="mt-10 space-y-0">
            {STEPS.map((step, index) => {
              const state = stepState(index);
              const isLast = index === STEPS.length - 1;
              const Icon = step.icon;

              return (
                <div key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                        state === 'done'
                          ? 'bg-gradient-to-br from-fuchsia-500 to-pink-600 ring-4 ring-fuchsia-100'
                          : state === 'in-progress'
                            ? 'bg-white ring-4 ring-fuchsia-200'
                            : 'bg-gray-100 ring-4 ring-gray-50'
                      }`}
                    >
                      {state === 'done' ? (
                        <Check className="h-4 w-4 text-white" strokeWidth={3} />
                      ) : state === 'in-progress' ? (
                        <Loader2 className="h-4 w-4 animate-spin text-fuchsia-600" strokeWidth={2.5} />
                      ) : (
                        <Icon className="h-4 w-4 text-gray-400" strokeWidth={2} />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 rounded-full transition-colors duration-300 ${
                          state === 'done' ? 'bg-gradient-to-b from-fuchsia-500 to-pink-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-8 pt-1.5">
                    <p
                      className={`text-sm font-medium transition-colors duration-300 sm:text-base ${
                        state === 'pending' ? 'text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTAs */}
          <div
            className={`mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-6 transition-opacity duration-500 ${
              complete ? 'opacity-100' : 'pointer-events-none opacity-40'
            }`}
            aria-disabled={!complete}
          >
            <a
              href="https://github.com/archestra-ai/archestra"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
            >
              <UserPlus className="h-4 w-4" />
              Go to the repository
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://github.com/archestra-ai/archestra/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              Go to Issues
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
