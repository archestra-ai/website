import { Linkedin } from 'lucide-react';
import { Metadata } from 'next';

import Footer from '@components/Footer';
import Header from '@components/Header';
import { Card, CardContent } from '@components/ui/card';
import constants from '@constants';

const {
  website: { urls: websiteUrls, keywords: websiteKeywords },
  company: {
    name: companyName,
    alternateName: companyAlternateName,
    description: companyDescription,
    people: { joey: JOEY, matvey: MATVEY, ildar: ILDAR },
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
            <p className="text-lg text-gray-600 text-center mb-12">
              Founded with urgency by engineers passionate about the future of AI
            </p>

            {/* Team Photo */}
            <div className="mb-12">
              <img
                src={websiteUrls.teamPhotoRelativeUrl}
                alt={`${constants.company.alternateName} founding team - Joey, Ildar, and Matvey`}
                className="w-full max-w-4xl mx-auto rounded-xl shadow-lg"
              />
            </div>

            {/* Team Member Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Joey */}
              <Card className="border-2 hover:border-yellow-200 transition-colors">
                <CardContent className="p-6 text-left">
                  <h3 className="font-bold text-xl mb-2">{JOEY.name}</h3>
                  <p className="text-gray-700 font-medium mb-1">{JOEY.jobTitle}</p>
                  <p className="text-gray-500 text-sm mb-3">
                    {JOEY.address.addressLocality}, {JOEY.address.addressCountry}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{JOEY.description}</p>
                  <div className="flex gap-3">
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
                  <div className="flex gap-3">
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
                  <div className="flex gap-3">
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
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
