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
import { Search, X, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { MCPServer, getMCPServerName, getMCPServerGitHubUrl } from "./data/types";
import { QualityBar } from "./components/quality-bar";
import { useSearchParams, useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 30;

interface MCPCatalogClientProps {
  mcpServers: MCPServer[];
  categories: string[];
  languages: string[];
}


export default function MCPCatalogClient({ mcpServers, categories, languages }: MCPCatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serverGridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Initialize state from URL parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "All");
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || "All");
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || "quality");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
    searchParams.get('dir') as 'asc' | 'desc' || 'desc'
  );
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "All" || selectedLanguage !== "All";
  
  // Count active filters
  const activeFilterCount = [
    searchQuery !== "",
    selectedCategory !== "All",
    selectedLanguage !== "All"
  ].filter(Boolean).length;
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedLanguage("All");
  };
  
  // Handle sort button click with three states: desc -> asc -> null -> desc
  const handleSortClick = (field: string) => {
    if (sortBy === field) {
      // Same field clicked, cycle through states
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection(null);
        setSortBy('quality'); // Reset to default
      } else {
        setSortDirection('desc');
      }
    } else {
      // Different field clicked
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
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
    if (selectedLanguage !== 'All') params.set('language', selectedLanguage);
    if (sortBy && sortDirection) {
      params.set('sort', sortBy);
      params.set('dir', sortDirection);
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/mcp-catalog';
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedCategory, selectedLanguage, sortBy, sortDirection, router]);

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
      selectedCategory === "All" || 
      (selectedCategory === "Uncategorized" && server.category === null) ||
      server.category === selectedCategory;
    const matchesLanguage =
      selectedLanguage === "All" || server.programmingLanguage === selectedLanguage;
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  // Sort filtered servers
  const sortedServers = sortDirection === null ? [...filteredServers] : [...filteredServers].sort((a, b) => {
    let result = 0;
    
    switch (sortBy) {
      case "quality":
        // Sort by quality score, null values last
        if (a.qualityScore === null && b.qualityScore === null) return 0;
        if (a.qualityScore === null) return 1;
        if (b.qualityScore === null) return -1;
        result = a.qualityScore - b.qualityScore;
        break;
      
      case "stars":
        // Sort by GitHub stars
        result = (a.gh_stars || 0) - (b.gh_stars || 0);
        break;
      
      case "contributors":
        // Sort by contributors
        result = (a.gh_contributors || 0) - (b.gh_contributors || 0);
        break;
      
      case "issues":
        // Sort by issues
        result = (a.gh_issues || 0) - (b.gh_issues || 0);
        break;
      
      case "updated":
        // Sort by last updated - using last_scraped_at
        if (!a.last_scraped_at && !b.last_scraped_at) return 0;
        if (!a.last_scraped_at) return 1;
        if (!b.last_scraped_at) return -1;
        result = new Date(a.last_scraped_at).getTime() - new Date(b.last_scraped_at).getTime();
        break;
      
      default:
        return 0;
    }
    
    // Apply sort direction
    return sortDirection === 'desc' ? -result : result;
  });

  // Reset displayed items when filters change
  useEffect(() => {
    setDisplayedItems(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCategory, selectedLanguage, sortBy]);

  // Load more items
  const loadMore = useCallback(() => {
    if (isLoading || displayedItems >= sortedServers.length) return;
    
    setIsLoading(true);
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setDisplayedItems(prev => Math.min(prev + ITEMS_PER_PAGE, sortedServers.length));
      setIsLoading(false);
    }, 200);
  }, [isLoading, displayedItems, sortedServers.length]);

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
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900">Search & Filter</CardTitle>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors group"
                >
                  <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs font-medium group-hover:bg-gray-300">
                    {activeFilterCount}
                  </span>
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>
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
                          : category === "Uncategorized"
                          ? mcpServers.filter(s => s.category === null).length
                          : mcpServers.filter(s => s.category === category).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Programming Languages */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Languages</h3>
                <div className="space-y-1">
                  {languages.map((language) => (
                    <button
                      key={language}
                      onClick={() => setSelectedLanguage(language)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedLanguage === language
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {language}
                      <span className="float-right text-xs text-gray-500">
                        {language === "All" 
                          ? mcpServers.length 
                          : mcpServers.filter(s => s.programmingLanguage === language).length}
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
        {/* Sorting Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {sortedServers.length} servers found
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleSortClick('quality')}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 transition-colors ${
                sortBy === 'quality' && sortDirection !== null
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Quality
              {sortBy === 'quality' && sortDirection === 'desc' && <ChevronDown size={14} />}
              {sortBy === 'quality' && sortDirection === 'asc' && <ChevronUp size={14} />}
              {sortBy !== 'quality' && <ChevronsUpDown size={14} className="opacity-40" />}
            </button>
            
            <button
              onClick={() => handleSortClick('stars')}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 transition-colors ${
                sortBy === 'stars' && sortDirection !== null
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Stars
              {sortBy === 'stars' && sortDirection === 'desc' && <ChevronDown size={14} />}
              {sortBy === 'stars' && sortDirection === 'asc' && <ChevronUp size={14} />}
              {sortBy !== 'stars' && <ChevronsUpDown size={14} className="opacity-40" />}
            </button>
            
            <button
              onClick={() => handleSortClick('contributors')}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 transition-colors ${
                sortBy === 'contributors' && sortDirection !== null
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Contributors
              {sortBy === 'contributors' && sortDirection === 'desc' && <ChevronDown size={14} />}
              {sortBy === 'contributors' && sortDirection === 'asc' && <ChevronUp size={14} />}
              {sortBy !== 'contributors' && <ChevronsUpDown size={14} className="opacity-40" />}
            </button>
            
            <button
              onClick={() => handleSortClick('issues')}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 transition-colors ${
                sortBy === 'issues' && sortDirection !== null
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Issues
              {sortBy === 'issues' && sortDirection === 'desc' && <ChevronDown size={14} />}
              {sortBy === 'issues' && sortDirection === 'asc' && <ChevronUp size={14} />}
              {sortBy !== 'issues' && <ChevronsUpDown size={14} className="opacity-40" />}
            </button>
            
            <button
              onClick={() => handleSortClick('updated')}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 transition-colors ${
                sortBy === 'updated' && sortDirection !== null
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Updated
              {sortBy === 'updated' && sortDirection === 'desc' && <ChevronDown size={14} />}
              {sortBy === 'updated' && sortDirection === 'asc' && <ChevronUp size={14} />}
              {sortBy !== 'updated' && <ChevronsUpDown size={14} className="opacity-40" />}
            </button>
          </div>
        </div>
        
        {sortedServers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedServers.slice(0, displayedItems).map((server) => {
                // Preserve current state in the link
                const params = new URLSearchParams();
                if (searchQuery) params.set('search', searchQuery);
                if (selectedCategory !== 'All') params.set('category', selectedCategory);
                if (selectedLanguage !== 'All') params.set('language', selectedLanguage);
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
            {displayedItems < sortedServers.length && (
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
                    Showing {displayedItems} of {sortedServers.length} servers
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No servers found{searchQuery && ` matching "${searchQuery}"`}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
              {selectedLanguage !== "All" && ` using ${selectedLanguage}`}
            </p>
            <p className="text-gray-400 text-sm mt-2">Try searching with different keywords or filters</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                <X size={16} />
                Remove Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}