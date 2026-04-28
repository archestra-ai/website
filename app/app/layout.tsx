import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { Roboto_Mono } from 'next/font/google';

import ConditionalAnalytics from '@components/ConditionalAnalytics';
import GDPRConsentPanel from '@components/GDPRConsentPanel';
import constants from '@constants';

import './globals.css';

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

const {
  website: { urls: websiteUrls, keywords: websiteKeywords },
  company: {
    name: companyName,
    alternateName: companyAlternateName,
    tagline: companyTagline,
    description: companyDescription,
    foundingDate: companyFoundingDate,
    address: companyAddress,
    people: companyPeople,
  },
  twitter: { handle: twitterHandle },
  github: {
    archestra: {
      archestra: { repoUrl: githubArchestraRepoUrl },
    },
  },
} = constants;

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: companyName,
  alternateName: companyAlternateName,
  url: websiteUrls.base,
  logo: websiteUrls.logoAbsoluteUrl,
  description: companyDescription,
  sameAs: [githubArchestraRepoUrl, 'https://www.linkedin.com/company/archestra-ai/'],
  foundingDate: companyFoundingDate,
  founders: [companyPeople.matvey, companyPeople.ildar],
  address: {
    '@type': 'PostalAddress',
    addressCountry: companyAddress.addressCountry,
    addressLocality: companyAddress.addressLocality,
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: companyName,
  url: websiteUrls.base,
  description: companyDescription,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${websiteUrls.mcpCatalog}?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(websiteUrls.base),
  title: {
    default: companyTagline,
    template: `%s | ${companyName}`,
  },
  description: companyDescription,
  keywords: websiteKeywords,
  authors: [{ name: companyPeople.matvey.name }, { name: companyPeople.ildar.name }, { name: companyPeople.joey.name }],
  creator: companyName,
  publisher: companyName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: websiteUrls.base,
    siteName: companyName,
    title: companyTagline,
    description: companyDescription,
    images: [
      {
        url: websiteUrls.logoAbsoluteUrl,
        width: 1200,
        height: 630,
        alt: companyTagline,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: companyTagline,
    description: companyDescription,
    images: [websiteUrls.logoAbsoluteUrl],
    creator: twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      </head>
      <body className={robotoMono.variable}>
        {children}
        <GDPRConsentPanel />
        <ConditionalAnalytics gaId={constants.googleAnalytics.measurementId} />
        <SpeedInsights />
      </body>
    </html>
  );
}
