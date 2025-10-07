import { BookOpen, Home, Search } from 'lucide-react';
import Link from 'next/link';

import Header from '@components/Header';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative flex items-center justify-center">
        {/* Grid Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Error */}
            <div className="mb-8">
              <h1 className="text-8xl sm:text-9xl font-bold text-gray-200 mb-4">404</h1>
              <div className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Documentation Not Found</div>
              <p className="text-gray-600">The documentation page you're looking for doesn't exist or has been moved.</p>
            </div>

            {/* Suggestions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">What you can do:</h2>
              <ul className="space-y-3 text-left">
                <li className="flex items-start gap-3">
                  <Search className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Browse documentation</span>
                    <p className="text-sm text-gray-600">Explore our guides for Desktop and Platform</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Getting Started</span>
                    <p className="text-sm text-gray-600">Check out our quickstart guides to begin</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Return home</span>
                    <p className="text-sm text-gray-600">Go back to the main documentation page</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Docs Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
