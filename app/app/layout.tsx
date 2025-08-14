import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata, Viewport } from 'next';

import { PostHogProvider } from '@components/PostHogProvider';
import constants from '@constants';

import './globals.css';

const {
  website: { urls: websiteUrls, keywords: websiteKeywords },
  company: { name: companyName, tagline: companyTagline, description: companyDescription, people: companyPeople },
  twitter: { handle: twitterHandle },
} = constants;

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
      <body>
        <PostHogProvider>{children}</PostHogProvider>
        <GoogleAnalytics gaId="G-XYZ" />
      </body>
    </html>
  );
}
