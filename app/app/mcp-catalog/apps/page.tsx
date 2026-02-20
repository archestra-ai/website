import { Metadata } from 'next';
import { Suspense } from 'react';

import Footer from '@components/Footer';
import Header from '@components/Header';
import McpAppsClient from '@mcpCatalog/components/McpAppsClient';
import { getAppCategories, getAppPricingOptions, loadApps } from '@mcpCatalog/lib/apps';

export const metadata: Metadata = {
  title: 'MCP Apps Catalog | Browse MCP Client Applications',
  description:
    'Explore the catalog of applications that support the Model Context Protocol (MCP) as clients. Find IDEs, desktop apps, automation tools, and frameworks that connect to MCP servers.',
  keywords: ['MCP apps', 'MCP clients', 'Model Context Protocol apps', 'Claude Desktop', 'Cursor', 'MCP IDEs'],
  openGraph: {
    title: 'MCP Apps Catalog | Browse MCP Client Applications',
    description:
      'Explore apps that consume MCP servers – IDEs, desktop clients, automation platforms, and AI frameworks with native MCP support.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MCP Apps Catalog | Browse MCP Client Applications',
    description:
      'Explore apps that consume MCP servers – IDEs, desktop clients, automation platforms, and AI frameworks with native MCP support.',
  },
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function McpAppsPage() {
  const apps = loadApps();
  const categories = getAppCategories(apps);
  const pricingOptions = getAppPricingOptions(apps);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative flex flex-col">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Page Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                MCP Apps <span className="text-2xl sm:text-3xl lg:text-4xl text-gray-600">Catalog</span>
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                Beta
              </span>
            </div>

            <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-2xl">
              {apps.length} applications that consume MCP servers — IDEs, desktop clients, automation platforms, and AI
              frameworks with native{' '}
              <a
                href="https://modelcontextprotocol.io"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Model Context Protocol
              </a>{' '}
              support.
            </p>

            {/* Breadcrumb navigation */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <a href="/mcp-catalog" className="hover:text-gray-900 transition-colors">
                MCP Catalog
              </a>
              <span>/</span>
              <span className="text-gray-900 font-medium">MCP Apps</span>
            </nav>

            {/* Info banner */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-2xl">
              <p className="text-sm text-purple-800">
                <span className="font-semibold">What is an MCP App?</span> An MCP app is a client application that
                connects to MCP servers to extend its AI capabilities. Unlike MCP servers (which provide tools and
                context), MCP apps <em>consume</em> those servers — enabling your AI assistant, IDE, or automation
                platform to access real-world data and actions.
              </p>
            </div>
          </div>

          <Suspense fallback={<div>Loading apps...</div>}>
            <McpAppsClient apps={apps} categories={categories} pricingOptions={pricingOptions} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
