"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import Link from "next/link";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import { MCPServer, getMCPServerName, getMCPServerGitHubUrl } from "../../data/types";
import { QualityBar } from "../../components/quality-bar";
import { useSearchParams, useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 30;

interface MCPCatalogClientProps {
  mcpServers: MCPServer[];
  categories: string[];
}


export default function MCPCatalogClient({ mcpServers, categories }: MCPCatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serverGridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Initialize state from URL parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "All");
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Restore scroll position
  useEffect(() => {
    const scrollY = searchParams.get('scroll');
    if (scrollY && serverGridRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.scrollTo(0, parseInt(scrollY));
      }, 100);
    }
  }, []);
  
  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/mcp-catalog';
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedCategory, router]);

  const filteredServers = mcpServers.filter((server) => {
    const query = searchQuery.toLowerCase();
    const serverName = getMCPServerName(server);
    const githubUrl = getMCPServerGitHubUrl(server);
    const matchesSearch =
      serverName.toLowerCase().includes(query) ||
      server.description.toLowerCase().includes(query) ||
      githubUrl.toLowerCase().includes(query) ||
      server.gitHubOrg.toLowerCase().includes(query) ||
      server.gitHubRepo.toLowerCase().includes(query) ||
      (server.repositoryPath && server.repositoryPath.toLowerCase().includes(query)) ||
      (server.readme && server.readme.toLowerCase().includes(query));
    const matchesCategory =
      selectedCategory === "All" || server.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Reset displayed items when filters change
  useEffect(() => {
    setDisplayedItems(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCategory]);

  // Load more items
  const loadMore = useCallback(() => {
    if (isLoading || displayedItems >= filteredServers.length) return;
    
    setIsLoading(true);
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setDisplayedItems(prev => Math.min(prev + ITEMS_PER_PAGE, filteredServers.length));
      setIsLoading(false);
    }, 200);
  }, [isLoading, displayedItems, filteredServers.length]);

  // Set up intersection observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMore]);

  return (
    <div className="flex gap-8">
      {/* Categories Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  type="text"
                  placeholder="Search servers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              
              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category
                          ? "bg-yellow-100 text-yellow-800 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                      <span className="float-right text-xs text-gray-500">
                        {category === "All" 
                          ? mcpServers.length 
                          : mcpServers.filter(s => s.category === category).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Grid */}
      <div className="flex-1" ref={serverGridRef}>
        {filteredServers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServers.slice(0, displayedItems).map((server) => {
                // Preserve current state in the link
                const params = new URLSearchParams();
                if (searchQuery) params.set('search', searchQuery);
                if (selectedCategory !== 'All') params.set('category', selectedCategory);
                if (isClient) {
                  params.set('scroll', window.scrollY.toString());
                }
                
                return (
                  <Link 
                    key={server.slug} 
                    href={`/mcp-catalog/${server.slug}?${params.toString()}`}
                    className="block"
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">
                            {server.programmingLanguage}
                          </Badge>
                          <Badge variant="outline">
                            {server.category || 'Uncategorized'}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">
                          {getMCPServerName(server)}
                        </CardTitle>
                        <div className="text-sm text-gray-500 mb-2 font-mono" style={{overflowWrap: 'break-word', wordBreak: 'keep-all'}}>
                          <span>{server.gitHubOrg}/{server.gitHubRepo}</span>
                          {server.repositoryPath && (
                            <>
                              <span>/</span>
                              <span className="text-blue-600">{server.repositoryPath}</span>
                            </>
                          )}
                        </div>
                        {server.description !== "We're evaluating this MCP server" && (
                          <CardDescription>
                            {server.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <QualityBar score={server.qualityScore} />
                          <div className="flex flex-wrap gap-2">
                            {server.qualityScore !== null ? (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <span>⭐ {server.gh_stars}</span>
                                <span>👥 {server.gh_contributors}</span>
                                <span>📋 {server.gh_issues}</span>
                              </div>
                            ) : null}
                            {server.framework && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {server.framework}
                              </span>
                            )}
                            {server.gh_releases && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                releases
                              </span>
                            )}
                            {server.gh_ci_cd && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                ci/cd
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            
            {/* Load More Trigger */}
            {displayedItems < filteredServers.length && (
              <div 
                ref={loadMoreRef} 
                className="flex justify-center py-8"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <span>Loading more servers...</span>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    Showing {displayedItems} of {filteredServers.length} servers
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No servers found matching "{searchQuery}"</p>
            <p className="text-gray-400 text-sm mt-2">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </div>
  );
}