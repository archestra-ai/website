import type { Metadata } from 'next'
import './globals.css'
import { PostHogProvider } from '../components/PostHogProvider'

export const metadata: Metadata = {
  metadataBase: new URL('https://archestra.ai'),
  title: {
    default: 'Archestra | Enterprise MCP Platform for AI Agents',
    template: '%s | Archestra'
  },
  description: 'Enterprise-grade platform enabling non-technical users to safely leverage AI agents and MCP (Model Context Protocol) servers with security guardrails and compliance.',
  keywords: ['MCP', 'Model Context Protocol', 'AI agents', 'enterprise AI', 'secure runtime', 'AI security', 'prompt injection prevention', 'AI compliance'],
  authors: [
    { name: 'Matvey Kukuy' },
    { name: 'Ildar Iskhakov' },
    { name: 'Joey Orlando' }
  ],
  creator: 'Archestra Inc.',
  publisher: 'Archestra Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://archestra.ai',
    siteName: 'Archestra',
    title: 'Archestra | Enterprise MCP Platform for AI Agents',
    description: 'Enterprise-grade platform enabling non-technical users to safely leverage AI agents and MCP servers with security guardrails.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Archestra - Enterprise MCP Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Archestra | Enterprise MCP Platform for AI Agents',
    description: 'Enterprise-grade platform for safely leveraging AI agents and MCP servers',
    images: ['/og-image.png'],
    creator: '@archestra_ai',
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
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
