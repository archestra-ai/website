'use client';

import { LogIn, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { GitHubStarButton } from '@components/GitHubStarButton';
import { UserProfile } from '@components/UserProfile';
import constants from '@constants';
import { authClient } from '@lib/auth-client';

const {
  company: { name: companyName },
  website: { urls: websiteUrls },
  slack: { joinCommunityUrl: slackJoinCommunityUrl },
} = constants;

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
            <span className="font-[family-name:var(--font-roboto-mono)] text-2xl text-black hidden lg:inline">
              Archestra.AI
            </span>
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

        {/* Right side - GitHub Star + Auth */}
        <div className="hidden lg:flex items-center gap-4">
          <GitHubStarButton />
          {isPending ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : session ? (
            <UserProfile />
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </div>
              )}
            </button>
          )}
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

            <div className="border-t border-gray-200 my-2" />

            {/* Auth section */}
            {isPending ? (
              <div className="px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ) : session ? (
              <UserProfile isMobile />
            ) : (
              <button
                onClick={() => {
                  handleGoogleSignIn();
                  setIsMobileMenuOpen(false);
                }}
                disabled={isLoading}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full text-left"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
