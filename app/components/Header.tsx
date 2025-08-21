'use client';

import { ChevronDown, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { GitHubStarButton } from '@components/GitHubStarButton';
import constants from '@constants';

const {
  company: { name: companyName },
  website: { urls: websiteUrls },
} = constants;

export default function Header() {
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductOpen, setIsMobileProductOpen] = useState(true);
  const [isMobileReportsOpen, setIsMobileReportsOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsReportsOpen(false);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setIsProductOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            {/* Product Dropdown */}
            <div className="relative" ref={productDropdownRef}>
              <button
                onClick={() => setIsProductOpen(!isProductOpen)}
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Product
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isProductOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProductOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <a
                    href="#"
                    className="block px-4 py-3 text-sm text-gray-400 hover:bg-gray-50 transition-colors rounded-lg cursor-not-allowed"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsProductOpen(false);
                    }}
                  >
                    <div className="font-medium">Personal Desktop App</div>
                    <div className="text-xs text-red-500 mt-0.5">Coming soon</div>
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-3 text-sm text-gray-400 hover:bg-gray-50 transition-colors rounded-lg cursor-not-allowed"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsProductOpen(false);
                    }}
                  >
                    <div className="font-medium">Multi-Tenant Enterprise Platform</div>
                    <div className="text-xs text-red-500 mt-0.5">Coming soon</div>
                  </a>
                </div>
              )}
            </div>

            <Link href="/blog" className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Blog
            </Link>
            <Link
              href="/mcp-catalog"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              MCP Catalog
            </Link>

            {/* Reports Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsReportsOpen(!isReportsOpen)}
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Reports
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isReportsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isReportsOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <Link
                    href="/state-of-mcp"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-lg"
                    onClick={() => setIsReportsOpen(false)}
                  >
                    <div className="font-medium">State of MCP Report Q3 2025</div>
                    <div className="text-xs text-gray-500 mt-0.5">Comprehensive analysis of the MCP ecosystem</div>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/about" className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
              About
            </Link>
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
            {/* Product Dropdown in Mobile */}
            <div className="px-3 py-2">
              <button
                onClick={() => setIsMobileProductOpen(!isMobileProductOpen)}
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors w-full text-left"
              >
                Product
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${isMobileProductOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isMobileProductOpen && (
                <div className="mt-2 ml-4">
                  <a
                    href="#"
                    className="block py-2 text-sm text-gray-400 cursor-not-allowed"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    Personal Desktop App <span className="text-xs text-red-500">(Coming soon)</span>
                  </a>
                  <a
                    href="#"
                    className="block py-2 text-sm text-gray-400 cursor-not-allowed"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    Multi-Tenant Enterprise Platform <span className="text-xs text-red-500">(Coming soon)</span>
                  </a>
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/mcp-catalog"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              MCP Catalog
            </Link>

            {/* Reports Dropdown in Mobile */}
            <div className="px-3 py-2">
              <button
                onClick={() => setIsMobileReportsOpen(!isMobileReportsOpen)}
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors w-full text-left"
              >
                Reports
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${isMobileReportsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isMobileReportsOpen && (
                <div className="mt-2 ml-4">
                  <Link
                    href="/state-of-mcp"
                    className="block py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    State of MCP Report Q3 2025
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
