import { AlertTriangle, Code2, Github, Network, Plug, Shield, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import Link from 'next/link';

import Footer from '@components/Footer';
import HeaderWithBanner from '@components/HeaderWithBanner';
import constants from '@constants';

const {
  company: {
    name: companyName,
    alternateName: companyAlternateName,
    description: companyDescription,
    foundingDate: companyFoundingDate,
    address: companyAddress,
    people: companyPeople,
  },
  website: { urls: websiteUrls },
  github: {
    archestra: {
      archestra: { repoUrl: githubArchestraRepoUrl },
    },
  },
} = constants;

export default async function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyName,
    alternateName: companyAlternateName,
    url: websiteUrls.base,
    logo: websiteUrls.logoAbsoluteUrl,
    description: companyDescription,
    sameAs: [githubArchestraRepoUrl],
    foundingDate: companyFoundingDate,
    founders: [companyPeople.matvey, companyPeople.ildar],
    address: {
      '@type': 'PostalAddress',
      addressCountry: companyAddress.addressCountry,
      addressLocality: companyAddress.addressLocality,
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HeaderWithBanner />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center gap-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Mitigate the "Lethal Trifecta"</h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl">
                Middleware for enterprises to secure agent-to-data connections
              </p>

              {/* Key Features */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                  <Code2 className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Open Source</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">Lightweight</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Enterprise-Ready</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium">Fine-Grained Guardrails</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                  <Network className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">MCP & A2A Support</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                  <Plug className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">Pluggable Proxy</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                  <Wrench className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">Custom Tool Calls</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Archestra Section */}
        <section className="py-20 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Enterprises Need Secure AI Agents
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                AI agents unlock tremendous value, but come with critical security challenges that must be addressed
              </p>
            </div>

            {/* Breaches List */}
            <div className="text-center mb-12">
              <p className="text-lg text-gray-700 mb-4 font-medium">Major AI platforms have been compromised:</p>
              <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-4xl mx-auto">
                <a
                  href="https://systemweakness.com/new-prompt-injection-attack-on-chatgpt-web-version-ef717492c5c2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  ChatGPT (Apr 2023) →
                </a>
                <a
                  href="https://embracethered.com/blog/posts/2023/google-bard-data-exfiltration/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  Google Bard (Nov 2023) →
                </a>
                <a
                  href="https://embracethered.com/blog/posts/2024/github-copilot-chat-prompt-injection-data-exfiltration/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  GitHub Copilot (Jun 2024) →
                </a>
                <a
                  href="https://labs.zenity.io/p/links-materials-living-off-microsoft-copilot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  Microsoft Copilot (Aug 2024) →
                </a>
                <a
                  href="https://promptarmor.substack.com/p/data-exfiltration-from-slack-ai-via"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  Slack AI (Aug 2024) →
                </a>
                <a
                  href="https://embracethered.com/blog/posts/2025/chatgpt-operator-prompt-injection-exploits/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  ChatGPT Operator (Feb 2025) →
                </a>
                <a
                  href="https://www.codeintegrity.ai/blog/notion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  Notion 3.0 (Sep 2025) →
                </a>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Challenges Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">The Challenges</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">⚠</span>
                    <div>
                      <span className="font-medium text-gray-900">Prompt Injection</span>
                      <p className="text-sm text-gray-600 mt-1">Malicious inputs manipulating agent behavior</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">⚠</span>
                    <div>
                      <span className="font-medium text-gray-900">Data Exfiltration</span>
                      <p className="text-sm text-gray-600 mt-1">Unauthorized access to sensitive enterprise data</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">⚠</span>
                    <div>
                      <span className="font-medium text-gray-900">Privilege Escalation</span>
                      <p className="text-sm text-gray-600 mt-1">Agents gaining unauthorized system permissions</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">⚠</span>
                    <div>
                      <span className="font-medium text-gray-900">Supply Chain Attacks</span>
                      <p className="text-sm text-gray-600 mt-1">Compromised dependencies and third-party tools</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Solutions Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Archestra Open Source</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <div>
                      <span className="font-medium text-gray-900">Built-in Guardrails</span>
                      <p className="text-sm text-gray-600 mt-1">Fine-grained controls for every agent interaction</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <div>
                      <span className="font-medium text-gray-900">Sandboxed Execution</span>
                      <p className="text-sm text-gray-600 mt-1">Isolated runtime preventing system compromise</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <div>
                      <span className="font-medium text-gray-900">Plug-in Architecture</span>
                      <p className="text-sm text-gray-600 mt-1">No need to update your agent code</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <div>
                      <span className="font-medium text-gray-900">Open & Auditable</span>
                      <p className="text-sm text-gray-600 mt-1">Transparent security you can verify yourself</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/docs"
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors inline-block"
                >
                  Read Documentation
                </Link>
                <Link
                  href="/book-demo"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
                >
                  Book a Demo
                </Link>
                <a
                  href="https://github.com/archestra-ai/archestra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  <span>Deploy</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contributors Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Contributors</h2>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for contributing and continuously making <b>Archestra</b> better, <b>you're awesome</b> 🫶
              </p>
              <div className="flex justify-center">
                <a
                  href="https://github.com/archestra-ai/archestra/graphs/contributors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://contrib.rocks/image?repo=archestra-ai/archestra"
                    alt="Contributors"
                    className="max-w-full"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
