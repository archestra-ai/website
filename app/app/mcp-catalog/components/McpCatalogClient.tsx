'use client';

import { ChevronDown, ChevronUp, ChevronsUpDown, Filter, Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { QualityBar } from '@mcpCatalog/components/QualityBar';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

const ITEMS_PER_PAGE = 30;

interface McpCatalogClientProps {
  mcpServers: ArchestraMcpServerManifest[];
  categories: string[];
  languages: string[];
  dependencies: string[];
  mcpFeatures: string[];
  serverTypes: string[];
  serverCounts: Map<string, number>;
}

export default function McpCatalogClient({
  mcpServers,
  categories,
  languages,
  dependencies,
  mcpFeatures,
  serverTypes,
  serverCounts,
}: McpCatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serverGridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Initialize state from URL parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || 'All');
  const [selectedDependency, setSelectedDependency] = useState(searchParams.get('dependency') || 'All');
  const [selectedFeature, setSelectedFeature] = useState(searchParams.get('feature') || 'All');
  const [selectedServerType, setSelectedServerType] = useState(searchParams.get('serverType') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'quality');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
    (searchParams.get('dir') as 'asc' | 'desc') || 'desc'
  );

  // Mobile filter state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Track if we've auto-switched to relevance sort
  const [hasAutoSwitchedToRelevance, setHasAutoSwitchedToRelevance] = useState(false);
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    selectedLanguage !== 'All' ||
    selectedDependency !== 'All' ||
    selectedFeature !== 'All' ||
    selectedServerType !== 'All';

  // Count active filters
  const activeFilterCount = [
    searchQuery !== '',
    selectedCategory !== 'All',
    selectedLanguage !== 'All',
    selectedDependency !== 'All',
    selectedFeature !== 'All',
    selectedServerType !== 'All',
  ].filter(Boolean).length;

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLanguage('All');
    setSelectedDependency('All');
    setSelectedFeature('All');
    setSelectedServerType('All');
    // Reset to quality sort when clearing filters
    if (sortBy === 'relevance') {
      setSortBy('quality');
      setSortDirection('desc');
    }
  };

  // Auto-switch to relevance sort when search query is entered
  useEffect(() => {
    if (searchQuery && !hasAutoSwitchedToRelevance) {
      setSortBy('relevance');
      setSortDirection('desc');
      setHasAutoSwitchedToRelevance(true);
    } else if (!searchQuery && hasAutoSwitchedToRelevance) {
      // Reset when search is cleared
      setSortBy('quality');
      setSortDirection('desc');
      setHasAutoSwitchedToRelevance(false);
    }
  }, [searchQuery, hasAutoSwitchedToRelevance]);

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
    if (selectedDependency !== 'All') params.set('dependency', selectedDependency);
    if (selectedFeature !== 'All') params.set('feature', selectedFeature);
    if (sortBy && sortDirection) {
      params.set('sort', sortBy);
      params.set('dir', sortDirection);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '/mcp-catalog';
    router.replace(newUrl, { scroll: false });
  }, [
    searchQuery,
    selectedCategory,
    selectedLanguage,
    selectedDependency,
    selectedFeature,
    sortBy,
    sortDirection,
    router,
  ]);

  // Calculate search relevance score for a server
  const calculateSearchRelevance = (
    { display_name: serverName, description, category, github_info, readme }: ArchestraMcpServerManifest,
    query: string
  ): number => {
    if (!query) return 0;

    const lowerQuery = query.toLowerCase();
    let score = 0;

    // Exact name match (highest priority)
    if (serverName === lowerQuery) {
      score += 100;
    } else if (serverName.includes(lowerQuery)) {
      // Name contains query
      if (serverName.startsWith(lowerQuery)) {
        score += 60; // Higher score for prefix matches
      } else {
        score += 40;
      }
    }

    // Description match
    if (description && description.toLowerCase().includes(lowerQuery)) {
      score += 30;
    }

    // Category match
    if (category && category.toLowerCase().includes(lowerQuery)) {
      score += 35;
    }

    // For GitHub servers, check repo/owner/path
    if (github_info) {
      const { repo: gitHubRepo, owner: gitHubOwner, path: gitHubPath } = github_info;

      // Repository name match (without github.com)
      if (gitHubRepo.toLowerCase().includes(lowerQuery)) {
        score += 20;
      }

      // Organization name match
      if (gitHubOwner.toLowerCase().includes(lowerQuery)) {
        score += 15;
      }

      // URL path match (for repository paths)
      if (gitHubPath && gitHubPath.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }
    }

    // README match (lowest priority)
    if (readme && readme.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }

    // Boost score for servers where the query matches multiple fields
    const matchFields = [
      serverName.includes(lowerQuery),
      description && description.toLowerCase().includes(lowerQuery),
      category && category.toLowerCase().includes(lowerQuery),
    ];

    // Add GitHub-specific matches if github_info exists
    if (github_info) {
      matchFields.push(
        github_info.repo.toLowerCase().includes(lowerQuery),
        github_info.owner.toLowerCase().includes(lowerQuery)
      );
    }

    const matchCount = matchFields.filter(Boolean).length;

    // Add bonus for multiple field matches (indicates more relevant result)
    if (matchCount > 1) {
      score += (matchCount - 1) * 10;
    }

    return score;
  };

  const filteredAndScoredServers = mcpServers
    .map((server) => ({
      server,
      searchScore: searchQuery ? calculateSearchRelevance(server, searchQuery) : 0,
    }))
    .filter(
      ({ server: { category, programming_language, dependencies, protocol_features, remote_url }, searchScore }) => {
        // Filter by search
        const matchesSearch = !searchQuery || searchScore > 0;

        // Filter by category
        const matchesCategory =
          selectedCategory === 'All' ||
          (selectedCategory === 'Uncategorized' && category === null) ||
          category === selectedCategory;

        // Filter by language
        const matchesLanguage = selectedLanguage === 'All' || programming_language === selectedLanguage;

        // Filter by dependency
        const matchesDependency =
          selectedDependency === 'All' ||
          (dependencies && dependencies.some((dep) => dep.name === selectedDependency && dep.importance >= 8));

        // Filter by MCP features
        const matchesFeature =
          selectedFeature === 'All' ||
          (selectedFeature === 'Tools' && protocol_features?.implementing_tools === true) ||
          (selectedFeature === 'Resources' && protocol_features?.implementing_resources === true) ||
          (selectedFeature === 'Prompts' && protocol_features?.implementing_prompts === true) ||
          (selectedFeature === 'Sampling' && protocol_features?.implementing_sampling === true) ||
          (selectedFeature === 'Roots' && protocol_features?.implementing_roots === true) ||
          (selectedFeature === 'Logging' && protocol_features?.implementing_logging === true) ||
          (selectedFeature === 'STDIO Transport' && protocol_features?.implementing_stdio === true) ||
          (selectedFeature === 'Streamable HTTP' && protocol_features?.implementing_streamable_http === true) ||
          (selectedFeature === 'OAuth2' && protocol_features?.implementing_oauth2 === true);

        // Filter by server type
        const matchesServerType =
          selectedServerType === 'All' ||
          (selectedServerType === 'Remote' && remote_url !== undefined && remote_url !== null) ||
          (selectedServerType === 'Self-hosted' && (remote_url === undefined || remote_url === null));

        return (
          matchesSearch &&
          matchesCategory &&
          matchesLanguage &&
          matchesDependency &&
          matchesFeature &&
          matchesServerType
        );
      }
    );

  // Sort filtered servers
  const sortedServers = [...filteredAndScoredServers].sort((a, b) => {
    if (sortDirection === null) return 0;

    let result = 0;
    const serverA = a.server;
    const serverB = b.server;

    switch (sortBy) {
      case 'relevance':
        // Sort by search relevance score
        result = a.searchScore - b.searchScore;
        break;
      case 'quality':
        // Sort by trust score, null values last
        if (serverA.quality_score === null && serverB.quality_score === null) return 0;
        if (serverA.quality_score === null) return 1;
        if (serverB.quality_score === null) return -1;
        result = serverA.quality_score - serverB.quality_score;
        break;

      case 'stars':
        // Sort by GitHub stars (remote servers without github_info get 0)
        result = (serverA.github_info?.stars || 0) - (serverB.github_info?.stars || 0);
        break;

      case 'contributors':
        // Sort by contributors (remote servers without github_info get 0)
        result = (serverA.github_info?.contributors || 0) - (serverB.github_info?.contributors || 0);
        break;

      case 'issues':
        // Sort by issues (remote servers without github_info get 0)
        result = (serverA.github_info?.issues || 0) - (serverB.github_info?.issues || 0);
        break;

      case 'updated':
        // Sort by last updated - using last_scraped_at
        if (!serverA.last_scraped_at && !serverB.last_scraped_at) return 0;
        if (!serverA.last_scraped_at) return 1;
        if (!serverB.last_scraped_at) return -1;
        result = new Date(serverA.last_scraped_at).getTime() - new Date(serverB.last_scraped_at).getTime();
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
  }, [searchQuery, selectedCategory, selectedLanguage, selectedDependency, sortBy]);

  // Load more items
  const loadMore = useCallback(() => {
    if (isLoading || displayedItems >= sortedServers.length) return;

    setIsLoading(true);
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setDisplayedItems((prev) => Math.min(prev + ITEMS_PER_PAGE, sortedServers.length));
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
    <div className="relative">
      {/* Mobile Filter Button */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter size={18} />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                {activeFilterCount}
              </span>
            )}
          </div>
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Mobile Filter Content */}
            <div className="p-4 space-y-6">
              {/* Search Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
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
              </div>

              {/* Server Type */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Server Type</h3>
                <div className="space-y-1">
                  {serverTypes.map((serverType) => (
                    <button
                      key={serverType}
                      onClick={() => setSelectedServerType(serverType)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedServerType === serverType
                          ? 'bg-indigo-100 text-indigo-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {serverType}
                      <span className="float-right text-xs text-gray-500">
                        {serverType === 'All'
                          ? mcpServers.length
                          : serverType === 'Remote'
                            ? mcpServers.filter((s) => s.remote_url !== undefined && s.remote_url !== null).length
                            : mcpServers.filter((s) => s.remote_url === undefined || s.remote_url === null).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dependencies */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">MCP Dependencies</h3>
                <div className="space-y-1">
                  {dependencies.slice(0, 7).map((dependency) => (
                    <button
                      key={dependency}
                      onClick={() => setSelectedDependency(dependency)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedDependency === dependency
                          ? 'bg-green-100 text-green-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {dependency}
                      <span className="float-right text-xs text-gray-500">
                        {dependency === 'All'
                          ? mcpServers.length
                          : mcpServers.filter(
                              (s) =>
                                s.dependencies &&
                                s.dependencies.some((dep) => dep.name === dependency && dep.importance >= 8)
                            ).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* MCP Features */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">MCP Features</h3>
                <div className="space-y-1">
                  {mcpFeatures.map((feature) => (
                    <button
                      key={feature}
                      onClick={() => setSelectedFeature(feature)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedFeature === feature
                          ? 'bg-purple-100 text-purple-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {feature}
                      <span className="float-right text-xs text-gray-500">
                        {feature === 'All'
                          ? mcpServers.length
                          : mcpServers.filter((s) => {
                              if (feature === 'Tools') return s.protocol_features?.implementing_tools === true;
                              if (feature === 'Resources') return s.protocol_features?.implementing_resources === true;
                              if (feature === 'Prompts') return s.protocol_features?.implementing_prompts === true;
                              if (feature === 'Sampling') return s.protocol_features?.implementing_sampling === true;
                              if (feature === 'Roots') return s.protocol_features?.implementing_roots === true;
                              if (feature === 'Logging') return s.protocol_features?.implementing_logging === true;
                              if (feature === 'STDIO Transport')
                                return s.protocol_features?.implementing_stdio === true;
                              if (feature === 'Streamable HTTP')
                                return s.protocol_features?.implementing_streamable_http === true;
                              if (feature === 'OAuth2') return s.protocol_features?.implementing_oauth2 === true;
                              return false;
                            }).length}
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
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {language}
                      <span className="float-right text-xs text-gray-500">
                        {language === 'All'
                          ? mcpServers.length
                          : mcpServers.filter((s) => s.programming_language === language).length}
                      </span>
                    </button>
                  ))}
                </div>
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
                          ? 'bg-yellow-100 text-yellow-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                      <span className="float-right text-xs text-gray-500">
                        {category === 'All'
                          ? mcpServers.length
                          : category === 'Uncategorized'
                            ? mcpServers.filter((s) => s.category === null).length
                            : mcpServers.filter((s) => s.category === category).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    clearFilters();
                    setShowMobileFilters(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 px-4 sm:px-6 lg:px-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
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

                {/* Server Type */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Server Type</h3>
                  <div className="space-y-1">
                    {serverTypes.map((serverType) => (
                      <button
                        key={serverType}
                        onClick={() => setSelectedServerType(serverType)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedServerType === serverType
                            ? 'bg-indigo-100 text-indigo-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {serverType}
                        <span className="float-right text-xs text-gray-500">
                          {serverType === 'All'
                            ? mcpServers.length
                            : serverType === 'Remote'
                              ? mcpServers.filter((s) => s.remote_url !== undefined && s.remote_url !== null).length
                              : mcpServers.filter((s) => s.remote_url === undefined || s.remote_url === null).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dependencies */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">MCP Dependencies</h3>
                  <div className="space-y-1">
                    {dependencies.slice(0, 7).map((dependency) => (
                      <button
                        key={dependency}
                        onClick={() => setSelectedDependency(dependency)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedDependency === dependency
                            ? 'bg-green-100 text-green-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {dependency}
                        <span className="float-right text-xs text-gray-500">
                          {dependency === 'All'
                            ? mcpServers.length
                            : mcpServers.filter(
                                (s) =>
                                  s.dependencies &&
                                  s.dependencies.some((dep) => dep.name === dependency && dep.importance >= 8)
                              ).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* MCP Features */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">MCP Features</h3>
                  <div className="space-y-1">
                    {mcpFeatures.map((feature) => (
                      <button
                        key={feature}
                        onClick={() => setSelectedFeature(feature)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedFeature === feature
                            ? 'bg-purple-100 text-purple-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {feature}
                        <span className="float-right text-xs text-gray-500">
                          {feature === 'All'
                            ? mcpServers.length
                            : mcpServers.filter((s) => {
                                if (feature === 'Tools') return s.protocol_features?.implementing_tools === true;
                                if (feature === 'Resources')
                                  return s.protocol_features?.implementing_resources === true;
                                if (feature === 'Prompts') return s.protocol_features?.implementing_prompts === true;
                                if (feature === 'Sampling') return s.protocol_features?.implementing_sampling === true;
                                if (feature === 'Roots') return s.protocol_features?.implementing_roots === true;
                                if (feature === 'Logging') return s.protocol_features?.implementing_logging === true;
                                if (feature === 'STDIO Transport')
                                  return s.protocol_features?.implementing_stdio === true;
                                if (feature === 'Streamable HTTP')
                                  return s.protocol_features?.implementing_streamable_http === true;
                                if (feature === 'OAuth2') return s.protocol_features?.implementing_oauth2 === true;
                                return false;
                              }).length}
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
                            ? 'bg-blue-100 text-blue-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {language}
                        <span className="float-right text-xs text-gray-500">
                          {language === 'All'
                            ? mcpServers.length
                            : mcpServers.filter((s) => s.programming_language === language).length}
                        </span>
                      </button>
                    ))}
                  </div>
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
                            ? 'bg-yellow-100 text-yellow-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {category}
                        <span className="float-right text-xs text-gray-500">
                          {category === 'All'
                            ? mcpServers.length
                            : category === 'Uncategorized'
                              ? mcpServers.filter((s) => s.category === null).length
                              : mcpServers.filter((s) => s.category === category).length}
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
          <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <div className="text-sm text-gray-600">{sortedServers.length} servers found</div>

            {/* Desktop Sort Buttons */}
            <div className="hidden sm:flex gap-2">
              {searchQuery && (
                <button
                  onClick={() => handleSortClick('relevance')}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 transition-colors ${
                    sortBy === 'relevance' && sortDirection !== null
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Relevance
                  {sortBy === 'relevance' && sortDirection === 'desc' && <ChevronDown size={14} />}
                  {sortBy === 'relevance' && sortDirection === 'asc' && <ChevronUp size={14} />}
                  {sortBy !== 'relevance' && <ChevronsUpDown size={14} className="opacity-40" />}
                </button>
              )}

              <button
                onClick={() => handleSortClick('quality')}
                className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 transition-colors ${
                  sortBy === 'quality' && sortDirection !== null
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Trust
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

            {/* Mobile Sort Dropdown */}
            <div className="sm:hidden">
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [newSort, newDir] = e.target.value.split('-');
                  setSortBy(newSort);
                  setSortDirection(newDir as 'asc' | 'desc');
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {searchQuery && (
                  <>
                    <option value="relevance-desc">Most Relevant</option>
                    <option value="relevance-asc">Least Relevant</option>
                  </>
                )}
                <option value="quality-desc">Highest Trust</option>
                <option value="quality-asc">Lowest Trust</option>
                <option value="stars-desc">Most Stars</option>
                <option value="stars-asc">Least Stars</option>
                <option value="contributors-desc">Most Contributors</option>
                <option value="contributors-asc">Least Contributors</option>
                <option value="issues-desc">Most Issues</option>
                <option value="issues-asc">Least Issues</option>
                <option value="updated-desc">Recently Updated</option>
                <option value="updated-asc">Least Recently Updated</option>
              </select>
            </div>
          </div>

          {sortedServers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {sortedServers.slice(0, displayedItems).map((item) => {
                  const {
                    name: serverId,
                    display_name: serverName,
                    github_info: gitHubInfo,
                    programming_language,
                    description,
                    category,
                    framework,
                    quality_score: qualityScore,
                    readme,
                    remote_url: remoteUrl,
                  } = item.server;
                  const searchScore = item.searchScore;
                  const hasArchestraBadge = readme && readme.toLowerCase().includes('archestra.ai');
                  const isRemoteServer = remoteUrl && !gitHubInfo;

                  // Preserve current state in the link
                  const params = new URLSearchParams();
                  if (searchQuery) params.set('search', searchQuery);
                  if (selectedCategory !== 'All') params.set('category', selectedCategory);
                  if (selectedLanguage !== 'All') params.set('language', selectedLanguage);
                  if (selectedDependency !== 'All') params.set('dependency', selectedDependency);
                  if (selectedFeature !== 'All') params.set('feature', selectedFeature);
                  if (selectedServerType !== 'All') params.set('serverType', selectedServerType);
                  if (isClient) {
                    params.set('scroll', window.scrollY.toString());
                  }

                  return (
                    <Link key={serverId} href={`/mcp-catalog/${serverId}?${params.toString()}`} className="block">
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full relative overflow-hidden">
                        {hasArchestraBadge && (
                          <div
                            className="absolute top-10 -right-12 bg-purple-600 text-white text-[10px] font-semibold px-12 py-1.5 transform rotate-45 shadow-sm z-10 text-center"
                            style={{ width: '200px' }}
                          >
                            Supporting catalog
                          </div>
                        )}
                        <CardHeader className="p-4 sm:p-6">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {isRemoteServer ? (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                  Remote Server
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {programming_language}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {category || 'Uncategorized'}
                              </Badge>
                            </div>
                            {searchQuery && searchScore > 0 && (
                              <Badge
                                variant="default"
                                className="bg-green-100 text-green-800 border-green-200"
                                title={`Relevance: ${searchScore}`}
                              >
                                Match
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl break-words">{serverName}</CardTitle>
                          {gitHubInfo && (
                            <div
                              className="text-sm text-gray-500 mb-2 font-mono"
                              style={{
                                overflowWrap: 'break-word',
                                wordBreak: 'keep-all',
                              }}
                            >
                              <span>
                                {gitHubInfo.owner}/{gitHubInfo.repo}
                              </span>
                              {gitHubInfo.path && (
                                <>
                                  <span>/</span>
                                  <span className="text-blue-600">{gitHubInfo.path}</span>
                                </>
                              )}
                            </div>
                          )}
                          {description !== "We're evaluating this MCP server" && (
                            <CardDescription>{description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                          <div className="space-y-4">
                            <QualityBar score={qualityScore} />
                            <div className="flex flex-wrap gap-2">
                              {qualityScore !== null && gitHubInfo ? (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  {(() => {
                                    const serverCount = serverCounts.get(`${gitHubInfo.owner}/${gitHubInfo.repo}`) || 1;
                                    const showDivided = serverCount > 1;
                                    return (
                                      <>
                                        <span title={showDivided ? `${gitHubInfo.stars} / ${serverCount}` : undefined}>
                                          ⭐{' '}
                                          {showDivided ? Math.round(gitHubInfo.stars / serverCount) : gitHubInfo.stars}
                                        </span>
                                        <span
                                          title={
                                            showDivided ? `${gitHubInfo.contributors} / ${serverCount}` : undefined
                                          }
                                        >
                                          👥{' '}
                                          {showDivided
                                            ? Math.round(gitHubInfo.contributors / serverCount)
                                            : gitHubInfo.contributors}
                                        </span>
                                        <span title={showDivided ? `${gitHubInfo.issues} / ${serverCount}` : undefined}>
                                          📋{' '}
                                          {showDivided
                                            ? Math.round(gitHubInfo.issues / serverCount)
                                            : gitHubInfo.issues}
                                        </span>
                                        {showDivided && (
                                          <span
                                            className="text-amber-600 ml-1"
                                            title={`Repository contains ${serverCount} MCP servers`}
                                          >
                                            ÷{serverCount}
                                          </span>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : null}
                              {framework && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{framework}</span>
                              )}
                              {gitHubInfo?.releases && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">releases</span>
                              )}
                              {gitHubInfo?.ci_cd && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">ci/cd</span>
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
                <div ref={loadMoreRef} className="flex justify-center py-8">
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
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                {selectedLanguage !== 'All' && ` using ${selectedLanguage}`}
                {selectedDependency !== 'All' && ` with ${selectedDependency}`}
                {selectedFeature !== 'All' && ` implementing ${selectedFeature}`}
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
    </div>
  );
}
