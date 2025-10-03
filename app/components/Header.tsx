'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { GitHubStarButton } from '@components/GitHubStarButton';
import constants from '@constants';

const {
  company: { name: companyName },
  website: { urls: websiteUrls },
  slack: { joinCommunityUrl: slackJoinCommunityUrl },
} = constants;

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container flex items-center px-4 md:px-6 justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src={websiteUrls.logoRelativeUrl}
              alt={`${companyName} Logo`}
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-mono text-2xl text-black hidden lg:inline">Archestra.AI</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 mt-1">
            <Link
              href="/desktop-agent"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Desktop Agent
            </Link>
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

            <Link href="/about" className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
              About Us
            </Link>

            <a
              href={slackJoinCommunityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Slack Community
            </a>
          </nav>
        </div>

        {/* GitHub Star Button - Desktop */}
        <div className="hidden lg:block">
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
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col px-4 py-2">
            <Link
              href="/desktop-agent"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Desktop Agent
            </Link>
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
              href="/about"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>

            <a
              href={slackJoinCommunityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Slack Community
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
