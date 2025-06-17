import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'archestra.ai',
  description: 'founded by Matvey and Ildar',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
