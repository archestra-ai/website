import type { Metadata } from 'next'
import './globals.css'
import { PostHogProvider } from '../components/PostHogProvider'

export const metadata: Metadata = {
  title: 'archestra.ai',
  description: 'Solving your daily tasks with AI-agents and MCP',
  generator: 'v0.dev',
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
