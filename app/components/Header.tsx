'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { GitHubStarButton } from '@components/GitHubStarButton';
import constants from '@constants';

import { useCommunityStats } from '../app/community-stream/data/use-stats';

const {
  company: { name: companyName },
  website: { urls: websiteUrls },
} = constants;

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const stats = useCommunityStats();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container flex items-center px-4 md:px-6 justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative h-10 w-10 shrink-0">
              <Image src={websiteUrls.logoRelativeUrl} alt={`${companyName} Logo`} fill className="object-contain" />
            </div>
            <span className="font-[family-name:var(--font-roboto-mono)] text-2xl text-black hidden lg:inline">
              Archestra.AI
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 mt-1">
            <Link href="/book-demo" className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Book Demo
            </Link>

            <Link href="/blog" className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Blog
            </Link>
            <Link href="/docs" className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Docs
            </Link>
            <Link
              href="/mcp-catalog"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              MCP Catalog
            </Link>

            <Link
              href="/mcp-catalog/apps"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              MCP Apps
            </Link>

            <Link href="/about" className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
              About Us
            </Link>

            <Link href="/careers" className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Careers
            </Link>

            <Link
              href="/community-stream"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center gap-1.5"
            >
              Community
              {stats.totalTodayMessages > 0 && (
                <span className="bg-red-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                  {stats.totalTodayMessages}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Right side - GitHub Star */}
        <div className="hidden lg:flex items-center gap-4">
          <GitHubStarButton />
        </div>

        {/* Mobile hamburger button and GitHub star */}
        <div className="flex lg:hidden items-center gap-2">
          <GitHubStarButton />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-gray-100">
          <nav className="flex flex-col px-4 py-2">
            <Link
              href="/book-demo"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Book Demo
            </Link>

            <Link
              href="/blog"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/docs"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Docs
            </Link>
            <Link
              href="/mcp-catalog"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              MCP Catalog
            </Link>

            <Link
              href="/mcp-catalog/apps"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              MCP Apps
            </Link>

            <Link
              href="/about"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>

            <Link
              href="/careers"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Careers
            </Link>

            <Link
              href="/community-stream"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors flex items-center gap-1.5"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Community
              {stats.totalTodayMessages > 0 && (
                <span className="bg-red-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                  {stats.totalTodayMessages}
                </span>
              )}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
