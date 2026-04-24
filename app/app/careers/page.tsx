import { CheckCircle, Code, Send } from 'lucide-react';
import { Metadata } from 'next';

import Footer from '@components/Footer';
import Header from '@components/Header';
import constants from '@constants';

const {
  website: { urls: websiteUrls, keywords: websiteKeywords },
  company: { name: companyName },
} = constants;

const TITLE = `We're Hiring | ${companyName}`;
const DESCRIPTION = 'Join the Archestra team and help build the enterprise MCP platform for AI agents.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [`${companyName} careers`, `${companyName} jobs`, 'software engineer', ...websiteKeywords],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${websiteUrls.base}/careers`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: {
    canonical: `${websiteUrls.base}/careers`,
  },
};

const HIRING_STEPS = [
  {
    title: 'Application',
    description: '',
  },
  {
    title: 'Interview Call',
    description: 'A quick 20-minute call to get to know each other.',
  },
  {
    title: 'Paid Open Source Contribution',
    description:
      "Make a contribution to our open source project. Once you pick an issue to work on, we'll assign a bounty to make sure you're compensated if your PR will be merged. We don't like free test tasks ourselves :)",
  },
  {
    title: 'First team meeting',
    description:
      "This meeting will be dedicated to the discussion around your contribution. It's a great opportunity to meet the whole team in a work environment.",
  },
  {
    title: 'Second team meeting',
    description: 'Reiterate on the contribution, discuss company and culture.',
  },
  {
    title: 'Offer',
    description: "It'll take us no more than one working day to come up with the offer.",
  },
];

const STEP_COLORS = [
  { ring: 'ring-blue-200', bg: 'bg-blue-600', line: 'from-blue-600 to-blue-500' },
  { ring: 'ring-blue-200', bg: 'bg-blue-500', line: 'from-blue-500 to-indigo-500' },
  { ring: 'ring-indigo-200', bg: 'bg-indigo-600', line: 'from-indigo-500 to-violet-500' },
  { ring: 'ring-violet-200', bg: 'bg-violet-600', line: 'from-violet-500 to-purple-500' },
  { ring: 'ring-purple-200', bg: 'bg-purple-600', line: 'from-purple-500 to-fuchsia-500' },
  { ring: 'ring-fuchsia-200', bg: 'bg-fuchsia-600', line: 'from-fuchsia-500 to-pink-500' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Hero section with gradient background */}
        <section className="relative">
          {/* Gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-violet-50" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-14">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight">
                Join us to build the next generation of{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  open source infrastructure
                </span>{' '}
                for AI.
              </h1>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="relative bg-white">
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              {/* Job Listing - Left (3 cols) */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Colored top bar */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                      <Code className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Software Engineer</h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                          Full-time
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                          London, UK / Montreal, Canada
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full">
                          Remote
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 text-gray-700">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">About the role</h3>
                      <p className="leading-relaxed">
                        We&apos;re a small team with exits to Grafana and Elastic building an open source AI
                        infrastructure. Archestra.AI is VC-funded with 3+ years of runway.
                      </p>
                      <p className="leading-relaxed mt-2">
                        We&apos;re looking for a software engineer to join the &ldquo;core&rdquo; team working on the
                        platform, or the &ldquo;edge&rdquo; customer-facing team. We&apos;re remote-first, with an
                        option to work on-site in London, UK / Montreal, Canada.
                      </p>
                      <p className="leading-relaxed mt-2">
                        This is an exciting opportunity to join a skilled, highly technical startup team at a very early
                        stage (but with real customers!), shape the product, and build open software on the edge of AI.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">What you&apos;ll work on</h3>
                      <ul className="space-y-2.5">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            <a
                              href="https://github.com/archestra-ai/archestra"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline"
                            >
                              Open source AI platform
                            </a>
                          </span>
                        </li>
                        {[
                          'Participate in the community & protocol-related working groups',
                          'Work directly with early customers to shape the product',
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">What we&apos;re looking for</h3>
                      <ul className="space-y-2.5">
                        {[
                          '6+ years of experience in software engineering roles',
                          'Heavy focus on leveraging AI in day-to-day work',
                          'Experience building, shipping and maintaining production software',
                          'Comfort with open source workflows (PRs, code review, public discussion)',
                          'Ability to work autonomously in a fast-moving early-stage team',
                          'Experience in B2C products is a plus, but not required',
                          'Located in a timezone compatible with North America: UK, Europe, US, Canada, Israel, Armenia, Georgia or similar. Unfortunately India, Pakistan and Southeast Asia won\u0027t work due to timezone gap.',
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
                      <ul className="space-y-2.5">
                        {['$100-$160k USD/year base salary', 'Stock Options', 'Optionally, relocation to the UK'].map(
                          (item) => (
                            <li key={item} className="flex items-start gap-2.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                    <p className="text-sm text-white mt-1">
                      It's a role of AI engineer and we really love candidates who use AI for their day-to-day work. We
                      will prioritize candidates who demonstrate that in their application and during the hiring
                      process. The secret signal will be usage of the word "deliberate" somewhere in the application.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hiring Process - Right (2 cols) */}
              <div className="lg:col-span-2">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Quick process based on your skills</h2>

                <div className="space-y-0">
                  {HIRING_STEPS.map((step, index) => {
                    const color = STEP_COLORS[index];
                    return (
                      <div key={step.title} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-9 h-9 rounded-full ${color.bg} text-white flex items-center justify-center text-sm font-bold flex-shrink-0 ring-4 ${color.ring}`}
                          >
                            {index + 1}
                          </div>
                          {index < HIRING_STEPS.length - 1 && (
                            <div className={`w-0.5 flex-1 bg-gradient-to-b ${color.line} mt-1 rounded-full`} />
                          )}
                        </div>
                        <div className="pb-8">
                          <h3 className="font-semibold text-gray-900 text-sm">{step.title}</h3>
                          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                            {index === 2 ? (
                              <>
                                Make a contribution to our{' '}
                                <a
                                  href="https://github.com/archestra-ai/archestra"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:underline"
                                >
                                  open source project
                                </a>
                                . Once you pick an issue to work on, we&apos;ll assign a bounty to make sure you&apos;re
                                compensated if your PR will be merged. We don&apos;t like free test tasks ourselves :)
                              </>
                            ) : (
                              step.description
                            )}
                          </p>
                          {index === 0 && (
                            <a
                              href="https://forms.gle/LdADkJmYApjcPHbt9"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300"
                            >
                              <Send className="h-3.5 w-3.5" />
                              Apply Now
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
