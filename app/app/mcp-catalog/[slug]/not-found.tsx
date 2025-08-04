import Link from "next/link";
import Header from "../../../components/header";
import { Search, Home, Github, ArrowLeft } from "lucide-react";

export default function ServerNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 relative flex items-center justify-center">
        {/* Grid Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        
        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <div className="max-w-2xl mx-auto mb-8">
            <Link
              href="/mcp-catalog"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Link>
          </div>
          
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Error */}
            <div className="mb-8">
              <h1 className="text-8xl sm:text-9xl font-bold text-gray-200 mb-4">404</h1>
              <div className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                MCP Server Not Found
              </div>
              <p className="text-gray-600 mb-2">
                This MCP server doesn't exist in our catalog yet.
              </p>
              <p className="text-sm text-gray-500">
                It might have been removed, renamed, or is waiting to be evaluated.
              </p>
            </div>
            
            {/* Suggestions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                What you can do:
              </h2>
              <ul className="space-y-3 text-left">
                <li className="flex items-start gap-3">
                  <Search className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Search for similar servers</span>
                    <p className="text-sm text-gray-600">
                      Use our search and filters to find what you need
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Github className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Add this server to the catalog</span>
                    <p className="text-sm text-gray-600">
                      If you know this server exists on GitHub, help us add it
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Browse all servers</span>
                    <p className="text-sm text-gray-600">
                      Explore our complete collection of MCP servers
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/mcp-catalog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
                Search Catalog
              </Link>
              
              <a
                href="https://github.com/archestra-ai/website/issues/new?title=Add%20missing%20MCP%20server&body=Please%20add%20this%20MCP%20server%20to%20the%20catalog:%0A%0AGitHub%20URL:%20"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
                Report Missing Server
              </a>
            </div>
            
            {/* Status message */}
            <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">🔄 We're constantly evaluating new servers!</span>
                <br />
                Our automated system evaluates servers for trust scores. 
                Check back soon or help us add this server.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}