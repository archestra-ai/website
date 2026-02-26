'use client';

import { useState } from 'react';

import Footer from '@components/Footer';
import Header from '@components/Header';
import QuickStartBlock from '@components/QuickStartBlock';

export default function OpenClawPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="min-h-[85vh] flex items-center relative bg-[#fafafa] overflow-hidden">
          {/* Subtle grid texture */}
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] [background-size:40px_40px]"></div>

          <div className="container px-4 md:px-6 max-w-6xl mx-auto relative">
            <div className="flex flex-col items-center text-center">
              {/* Oversized decorative text behind */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
                <span className="text-[12rem] md:text-[18rem] lg:text-[22rem] font-black text-gray-100/60 leading-none tracking-tighter">
                  ?
                </span>
              </div>

              <div className="relative space-y-6 max-w-4xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-950 leading-[1.15] tracking-tight">
                  How to bring{' '}
                  <span className="line-through decoration-gray-300 decoration-2 text-gray-400">ClawdBot</span>{' '}
                  <span className="line-through decoration-gray-300 decoration-2 text-gray-400">MoltBot</span>{' '}
                  <span className="text-gray-950">OpenClaw</span>-like agents to your organization{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    but secure
                  </span>{' '}
                  &amp; production&#8209;ready?
                </h1>

                <div className="flex justify-center pt-2">
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security / Lethal Trifecta Section */}
        <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"></div>

          <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="space-y-6">
                {/* Security Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 font-medium text-sm">Security Foundation</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  We've tested ClawdBot,{' '}
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    it's vulnerable
                  </span>
                </h2>

                <p className="text-lg text-gray-600 leading-relaxed">
                  Agents can leak data because of the <strong>Lethal Trifecta</strong> — a dangerous combination of:
                  access to private data, processing untrusted content, and external communication ability. When all
                  three are present, prompt injection can exfiltrate sensitive data.
                </p>

                <p className="text-lg text-gray-600 leading-relaxed">
                  Archestra provides <strong>deterministic guardrails</strong> preventing agents from leaking sensitive
                  data, corrupting systems, and following prompt injections.
                </p>

                {/* Examples of Hacks */}
                <div className="bg-red-50/50 backdrop-blur rounded-lg p-4 border border-red-200">
                  <p className="text-sm font-semibold text-red-900 mb-3">
                    This vulnerability is not new, it's a well-known problem:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <a
                      href="https://simonwillison.net/2023/Apr/14/new-prompt-injection-attack-on-chatgpt-web-version-markdown-imag/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-red-600 transition-colors"
                    >
                      - ChatGPT (Apr 2023)
                    </a>
                    <a
                      href="https://simonwillison.net/2023/Nov/4/hacking-google-bard-from-prompt-injection-to-data-exfiltration/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-red-600 transition-colors"
                    >
                      - Google Bard (Nov 2023)
                    </a>
                    <a
                      href="https://simonwillison.net/2024/Jun/16/github-copilot-chat-prompt-injection/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-red-600 transition-colors"
                    >
                      - GitHub Copilot (Jun 2024)
                    </a>
                    <a
                      href="https://simonwillison.net/2024/Aug/14/living-off-microsoft-copilot/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-red-600 transition-colors"
                    >
                      - Microsoft Copilot (Aug 2024)
                    </a>
                    <a
                      href="https://simonwillison.net/2024/Aug/20/data-exfiltration-from-slack-ai/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-red-600 transition-colors"
                    >
                      - Slack AI (Aug 2024)
                    </a>
                    <a
                      href="https://simonwillison.net/2025/Feb/17/chatgpt-operator-prompt-injection/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-red-600 transition-colors"
                    >
                      - ChatGPT Operator (Feb 2025)
                    </a>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="pt-4 text-sm">
                  <p className="text-gray-500 mb-2">Read more</p>
                  <div className="flex items-center gap-6">
                    <a
                      href="https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <span className="font-medium">Simon Willison</span>
                    </a>
                    <a
                      href="https://www.economist.com/leaders/2025/09/25/how-to-stop-ais-lethal-trifecta"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <span className="font-medium">The Economist</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column - Screenshot */}
              <div className="relative space-y-4">
                <div className="absolute -inset-4 bg-gradient-to-r from-red-400 to-orange-400 rounded-2xl blur-2xl opacity-15"></div>
                <div
                  className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                >
                  <img src="/clawdbot_hack.jpeg" alt="ClawdBot vulnerability demonstration" className="w-full h-auto" />
                </div>
                <ol className="relative text-sm text-gray-500 space-y-1 pl-1">
                  <li>1. Sending ClawdBot email with prompt injection</li>
                  <li>2. Asking ClawdBot to check e-mail</li>
                  <li>3. Receiving the private key from the hacked machine</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Accessible / Slack & Teams Section */}
        <section className="min-h-screen flex items-center bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"></div>

          <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Screenshot */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-400 to-green-400 rounded-2xl blur-2xl opacity-15"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                  <img
                    src="/sales-assistant-msteams-chat.png"
                    alt="Sales assistant in Microsoft Teams chat"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Right Column - Content */}
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Build secure Agents for your corporate{' '}
                  <span className="bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                    Slack and MS Teams
                  </span>{' '}
                  using Archestra
                </h2>

                <p className="text-lg text-gray-600 leading-relaxed">
                  It's like ClawdBot but secure and production-ready.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Try Yourself Section */}
        <section className="min-h-screen flex items-center bg-gray-50">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Only 5 minutes to run and try yourself</h2>
              </div>
              <QuickStartBlock showExposureOverlay />
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src="/clawdbot_hack.jpeg"
            alt="ClawdBot vulnerability demonstration"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
          />
        </div>
      )}

      <Footer />
    </div>
  );
}
