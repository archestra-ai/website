import { Linkedin } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';

import Footer from '@components/Footer';
import Header from '@components/Header';
import { Card, CardContent } from '@components/ui/card';
import constants from '@constants';

import EmailCodePanel from './EmailCodePanel';

const {
  website: { urls: websiteUrls, keywords: websiteKeywords },
  company: {
    name: companyName,
    alternateName: companyAlternateName,
    description: companyDescription,
    people: { joey: JOEY, matvey: MATVEY, ildar: ILDAR, dominik: DOMINIK, anna: ANNA, innokentii: INNOKENTII },
  },
} = constants;

const TITLE = `About ${companyName} | Team & Mission`;
const DESCRIPTION =
  'Meet the founding team from Grafana Labs and Elastic building the enterprise-grade MCP platform for AI agents.';

export const metadata: Metadata = {
  title: TITLE,
  description: companyDescription,
  keywords: [`${companyName} team`, `about ${companyName}`, ...websiteKeywords],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: websiteUrls.about,
    type: 'website',
    images: [
      {
        url: websiteUrls.teamPhotoAbsoluteUrl,
        width: 1200,
        height: 630,
        alt: `${companyAlternateName} founding team`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [websiteUrls.teamPhotoAbsoluteUrl],
  },
  alternates: {
    canonical: websiteUrls.about,
  },
};

export default function AboutPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': constants.website.structuredData,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Header />

      <main className="flex-1 relative">
        {/* Grid Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Team Section */}
          <div className="max-w-5xl mx-auto mb-16">
            {/* Team Photo */}
            <div className="mb-12">
              <div className="w-full max-w-4xl mx-auto rounded-xl shadow-lg overflow-hidden">
                <Image
                  src={websiteUrls.teamPhotoRelativeUrl}
                  alt={`${constants.company.alternateName} founding team - Joey, Ildar, and Matvey`}
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAA8DASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0Hj8m0TlsRb5NElgtYXDAfH2oA0R9R7r/9k="
                />
              </div>
            </div>

            {/* Team Member Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Joey */}
              <Card className="border-2 hover:border-yellow-200 transition-colors">
                <CardContent className="p-6 text-left">
                  <h3 className="font-bold text-xl mb-2">{JOEY.name}</h3>
                  <p className="text-gray-700 font-medium mb-1">{JOEY.jobTitle}</p>
                  <p className="text-gray-500 text-sm mb-3">
                    {JOEY.address.addressLocality}, {JOEY.address.addressCountry}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{JOEY.description}</p>
                  <EmailCodePanel email="joey@archestra.ai" />
                  <div className="flex justify-center gap-3 mt-3">
                    <a
                      href={JOEY.sameAs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Matvey */}
              <Card className="border-2 hover:border-green-200 transition-colors">
                <CardContent className="p-6 text-left">
                  <h3 className="font-bold text-xl mb-2">{MATVEY.name}</h3>
                  <p className="text-gray-700 font-medium mb-1">{MATVEY.jobTitle}</p>
                  <p className="text-gray-500 text-sm mb-3">
                    {MATVEY.address.addressLocality}, {MATVEY.address.addressCountry}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Third-time founder, engineer and passionate advocate for Open Source who relocated from Israel to
                    London to build this company, previously founding and leading Amixr as CEO (acquired by Grafana
                    Labs) and co-founding KeepHQ (acquired by Elastic).
                  </p>
                  <EmailCodePanel email="matvey@archestra.ai" />
                  <div className="flex justify-center gap-3 mt-3">
                    <a
                      href={MATVEY.sameAs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Ildar */}
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardContent className="p-6 text-left">
                  <h3 className="font-bold text-xl mb-2">{ILDAR.name}</h3>
                  <p className="text-gray-700 font-medium mb-1">{ILDAR.jobTitle}</p>
                  <p className="text-gray-500 text-sm mb-3">
                    {ILDAR.address.addressLocality}, {ILDAR.address.addressCountry}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Second-time founder who relocated from Singapore to the UK to build this company, bringing
                    experience as Ex-Principal at Grafana Labs and Ex-CTO at Amixr (acquired by Grafana Labs), and is a
                    devoted coffee enthusiast.
                  </p>
                  <EmailCodePanel email="ildar@archestra.ai" />
                  <div className="flex justify-center gap-3 mt-3">
                    <a
                      href={ILDAR.sameAs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Dominik */}
              <Card className="border-2 hover:border-purple-200 transition-colors">
                <CardContent className="p-6 text-left">
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/team/dominik.png"
                      alt={DOMINIK.name}
                      width={150}
                      height={150}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{DOMINIK.name}</h3>
                  <p className="text-gray-700 font-medium mb-1">{DOMINIK.jobTitle}</p>
                  <p className="text-gray-500 text-sm mb-3">
                    {DOMINIK.address.addressLocality}, {DOMINIK.address.addressCountry}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{DOMINIK.description}</p>
                  <EmailCodePanel email="dominik@archestra.ai" />
                  <div className="flex justify-center gap-3 mt-3">
                    <a
                      href={DOMINIK.sameAs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Anna */}
              <Card className="border-2 hover:border-pink-200 transition-colors">
                <CardContent className="p-6 text-left">
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/team/anna.jpg"
                      alt={ANNA.name}
                      width={150}
                      height={150}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{ANNA.name}</h3>
                  <p className="text-gray-700 font-medium mb-1">{ANNA.jobTitle}</p>
                  <p className="text-gray-500 text-sm mb-3">
                    {ANNA.address.addressLocality}, {ANNA.address.addressCountry}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{ANNA.description}</p>
                  <EmailCodePanel email="anna@archestra.ai" />
                  <div className="flex justify-center gap-3 mt-3">
                    <a
                      href={ANNA.sameAs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Innokentii */}
              <Card className="border-2 hover:border-orange-200 transition-colors">
                <CardContent className="p-6 text-left">
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/team/innokentii.jpeg"
                      alt={INNOKENTII.name}
                      width={150}
                      height={150}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{INNOKENTII.name}</h3>
                  <p className="text-gray-700 font-medium mb-1">{INNOKENTII.jobTitle}</p>
                  <p className="text-gray-500 text-sm mb-3">
                    {INNOKENTII.address.addressLocality}, {INNOKENTII.address.addressCountry}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{INNOKENTII.description}</p>
                  <EmailCodePanel email="ikonstantinov@archestra.ai" />
                  <div className="flex justify-center gap-3 mt-3">
                    <a
                      href={INNOKENTII.sameAs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Backed By Section */}
          <div className="max-w-6xl mx-auto mb-16">
            {/* All Investors Grid */}
            <div className="space-y-8">
              {/* VCs Section */}
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider text-center mb-6">
                  Venture Capital Partners
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {/* Lead Investor - Concept Ventures */}
                  <a
                    href="https://www.conceptventures.vc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-4 py-3 flex flex-col items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0 relative overflow-hidden"
                    style={{ backgroundColor: '#2069f7' }}
                  >
                    <div
                      className="absolute top-4 -left-6 bg-white text-black text-xs font-bold px-7 py-1 transform -rotate-45 shadow-sm"
                      style={{ lineHeight: '1' }}
                    >
                      Leading
                    </div>
                    <Image src="/logo_concept.svg" alt="Concept Ventures" width={80} height={27} className="h-auto" />
                    <p className="text-white text-center mt-2 text-sm font-medium">Concept Ventures</p>
                  </a>

                  <a
                    href="https://zeroprime.vc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-4 py-3 flex flex-col items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
                    style={{ backgroundColor: 'rgb(14, 30, 40)' }}
                  >
                    <Image
                      src="/logo_zero_prime.jpeg"
                      alt="Zero Prime Ventures"
                      width={80}
                      height={27}
                      className="h-auto"
                    />
                    <p className="text-white text-center mt-2 text-sm font-medium">Zero Prime Ventures</p>
                  </a>

                  <a
                    href="https://www.celeroventures.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors flex flex-col items-center justify-center flex-shrink-0"
                  >
                    <Image src="/logo_celero.png" alt="Celero Ventures" width={80} height={27} className="h-auto" />
                    <p className="text-gray-700 text-center mt-2 text-sm font-medium">Celero Ventures</p>
                  </a>

                  <a
                    href="https://rtp.vc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    <Image src="/logo_rtp.svg" alt="RTP Global" width={120} height={40} className="h-auto" />
                  </a>

                  <a
                    href="https://www.aloniq.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 border border-gray-200 hover:border-gray-400 transition-colors flex items-center justify-center flex-shrink-0"
                    style={{ paddingTop: '26px', paddingBottom: '26px' }}
                  >
                    <Image src="/logo_aloniq.svg" alt="Aloniq" width={120} height={40} className="h-auto" />
                  </a>
                </div>
              </div>

              {/* Angel Investors */}
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider text-center mb-4">
                  Angel Investors
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Max Hauser</p>
                        <p className="text-sm text-gray-600">Managing Director & Partner, BCG</p>
                      </div>
                      <a
                        href="https://www.linkedin.com/in/hausermax/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors ml-3"
                      >
                        <Linkedin size={18} />
                      </a>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Maxim Konovalov</p>
                        <p className="text-sm text-gray-600">Co-founder, Nginx</p>
                      </div>
                      <a
                        href="https://www.linkedin.com/in/maxim/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors ml-3"
                      >
                        <Linkedin size={18} />
                      </a>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Konstantin Vinogradov</p>
                        <p className="text-sm text-gray-600">GP, Runa Capital</p>
                      </div>
                      <a
                        href="https://www.linkedin.com/in/kvinogradov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors ml-3"
                      >
                        <Linkedin size={18} />
                      </a>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Stephen Whitworth</p>
                        <p className="text-sm text-gray-600">CEO, incident.io</p>
                      </div>
                      <a
                        href="https://www.linkedin.com/in/stephenwhitworth/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors ml-3"
                      >
                        <Linkedin size={18} />
                      </a>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Luke Harries</p>
                        <p className="text-sm text-gray-600">Elevenlabs</p>
                      </div>
                      <a
                        href="https://www.linkedin.com/in/luke-harries/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors ml-3"
                      >
                        <Linkedin size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Media Coverage Section */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider text-center mb-6">
                  Media Coverage
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <a
                    href="https://siliconangle.com/2025/08/14/archestra-raises-3-3m-secure-enterprise-use-ai-agents-mcp-servers/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">SiliconANGLE</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Archestra raises $3.3M to secure enterprise use of AI agents
                    </p>
                  </a>

                  <a
                    href="https://siliconcanals.com/archestra-ai-secures-e2-8m/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">Silicon Canals</p>
                    <p className="text-sm text-gray-600 mt-1">Archestra AI secures €2.8M</p>
                  </a>

                  <a
                    href="https://www.uktech.news/ai/archestra-raises-2-5m-to-protect-corporate-data-from-ai-agents-20250813"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">UKTN</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Archestra raises £2.5m to protect corporate data from AI agents
                    </p>
                  </a>

                  <a
                    href="https://techfundingnews.com/archestra-london-startup-3-3m-autonomous-agents-guardrails/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">Tech Funding News</p>
                    <p className="text-sm text-gray-600 mt-1">
                      London startup raises $3.3m for autonomous agents guardrails
                    </p>
                  </a>

                  <a
                    href="https://www.eu-startups.com/2025/08/london-based-archestra-raises-e2-8-million-to-stop-ai-agents-going-rogue/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">EU-Startups</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Archestra raises €2.8 million to stop AI agents going rogue
                    </p>
                  </a>

                  <a
                    href="https://www.uktechnews.info/2025/08/14/archestra-secures-2-5-million-pre-seed-investment-led-by-concept-ventures/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">UK Tech News</p>
                    <p className="text-sm text-gray-600 mt-1">Archestra secures £2.5 million pre-seed investment</p>
                  </a>

                  <a
                    href="https://www.techinasia.com/news/londonbased-archestra-raises-33m-enhance-ai-data-security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">Tech in Asia</p>
                    <p className="text-sm text-gray-600 mt-1">
                      London-based Archestra raises $3.3m to enhance AI data security
                    </p>
                  </a>

                  <a
                    href="https://startuprise.co.uk/london-based-archestra-secures-e2-8-million-in-pre-seed-round/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">StartupRise</p>
                    <p className="text-sm text-gray-600 mt-1">Archestra secures €2.8 million in pre-seed round</p>
                  </a>

                  <a
                    href="https://tech.eu/2025/08/14/archestra-raises-3-3m-to-build-guardrails-for-enterprise-ai-agents/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">Tech.eu</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Archestra raises $3.3m to build guardrails for enterprise AI agents
                    </p>
                  </a>

                  <a
                    href="https://itbrief.co.uk/story/archestra-ai-raises-3-3m-to-secure-enterprise-ai-agents"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">IT Brief UK</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Archestra AI raises $3.3m to secure enterprise AI agents
                    </p>
                  </a>

                  <a
                    href="https://businesscloud.co.uk/news/trio-who-moved-to-uk-to-launch-ai-startup-raise-2-4m/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">BusinessCloud</p>
                    <p className="text-sm text-gray-600 mt-1">Trio who moved to UK to launch AI startup raise £2.4m</p>
                  </a>

                  <a
                    href="https://startupnewswire.com/archestra-raises-2-8m-ai-agent-security/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">Startup News Wire</p>
                    <p className="text-sm text-gray-600 mt-1">Archestra raises €2.8m for AI agent security</p>
                  </a>

                  <a
                    href="https://securitybrief.co.uk/story/archestra-ai-raises-3-3m-to-secure-enterprise-ai-agents"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">SecurityBrief UK</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Archestra AI raises $3.3m to secure enterprise AI agents
                    </p>
                  </a>

                  <a
                    href="https://theaiinsider.tech/2025/08/20/archestra-raises-3-3m-to-secure-ai-agent-deployments-with-enterprise-ready-mcp-platform/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <p className="font-medium text-gray-900">The AI Insider</p>
                    <p className="text-sm text-gray-600 mt-1">Archestra raises $3.3m to secure AI agent deployments</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
