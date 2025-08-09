"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import { GitHubStarButton } from "./github-star-button";

export default function Header() {
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsReportsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container flex items-center px-4 md:px-6 justify-between h-16">
        <div className="flex items-center gap-8">
          <a
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="Archestra Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-mono text-2xl text-black hidden sm:inline">archestra.ai</span>
          </a>
          <nav className="hidden sm:flex items-center gap-6 mt-1">
            <a
              href="#"
              className="text-sm text-gray-400 font-medium cursor-not-allowed"
              onClick={(e) => e.preventDefault()}
            >
              Desktop App <span className="text-xs text-red-500">(Coming soon)</span>
            </a>
            <a
              href="/blog"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Blog
            </a>
            <a
              href="/mcp-catalog"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              MCP Catalog
            </a>
            
            {/* Reports Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsReportsOpen(!isReportsOpen)}
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Reports
                <ChevronDown 
                  className={`h-3.5 w-3.5 transition-transform ${
                    isReportsOpen ? "rotate-180" : ""
                  }`} 
                />
              </button>
              
              {isReportsOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <a
                    href="/state-of-mcp"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-lg"
                    onClick={() => setIsReportsOpen(false)}
                  >
                    <div className="font-medium">State of MCP Report Q3 2025</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Comprehensive analysis of the MCP ecosystem
                    </div>
                  </a>
                </div>
              )}
            </div>
            
            <a
              href="/about"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              About
            </a>
          </nav>
        </div>
        
        {/* GitHub Star Button - Desktop */}
        <div className="hidden sm:block">
          <GitHubStarButton />
        </div>
        
        {/* Mobile hamburger button and GitHub star */}
        <div className="flex sm:hidden items-center gap-2">
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
        <div className="sm:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col px-4 py-2">
            <a
              href="#"
              className="px-3 py-2 text-sm text-gray-400 font-medium rounded-lg"
              onClick={(e) => e.preventDefault()}
            >
              Desktop App <span className="text-xs text-red-500">(Coming soon)</span>
            </a>
            <a
              href="/blog"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </a>
            <a
              href="/mcp-catalog"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              MCP Catalog
            </a>
            
            {/* Reports Dropdown in Mobile */}
            <div className="px-3 py-2">
              <button
                onClick={() => setIsReportsOpen(!isReportsOpen)}
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors w-full text-left"
              >
                Reports
                <ChevronDown 
                  className={`h-3.5 w-3.5 transition-transform ${
                    isReportsOpen ? "rotate-180" : ""
                  }`} 
                />
              </button>
              
              {isReportsOpen && (
                <div className="mt-2 ml-4">
                  <a
                    href="/state-of-mcp"
                    className="block py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => {
                      setIsReportsOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    State of MCP Report Q3 2025
                  </a>
                </div>
              )}
            </div>
            
            <a
              href="/about"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}