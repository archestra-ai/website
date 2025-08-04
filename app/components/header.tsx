"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function Header() {
  const [isReportsOpen, setIsReportsOpen] = useState(false);
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
            className="font-mono text-2xl text-black hover:text-yellow-600 transition-colors"
          >
            archestra.ai
          </a>
          <nav className="hidden sm:flex items-center gap-6 mt-1">
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
        
        {/* Mobile menu */}
        <nav className="flex sm:hidden items-center gap-3">
          <a
            href="/mcp-catalog"
            className="text-sm text-gray-700 hover:text-gray-900 font-medium"
          >
            Catalog
          </a>
          <a
            href="/state-of-mcp"
            className="text-sm text-gray-700 hover:text-gray-900 font-medium"
          >
            Report
          </a>
          <a
            href="/about"
            className="text-sm text-gray-700 hover:text-gray-900 font-medium"
          >
            About
          </a>
        </nav>
      </div>
    </header>
  );
}