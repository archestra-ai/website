'use client';

import { useMemo, useState } from 'react';

import McpAppCard from '@mcpCatalog/components/McpAppCard';
import { ArchestraMcpApp } from '@mcpCatalog/types';

interface McpAppsClientProps {
  apps: ArchestraMcpApp[];
  categories: string[];
  pricingOptions: string[];
}

export default function McpAppsClient({ apps, categories, pricingOptions }: McpAppsClientProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState('All');
  const [openSourceOnly, setOpenSourceOnly] = useState(false);

  const filtered = useMemo(() => {
    return apps.filter((app) => {
      const q = search.toLowerCase();
      if (q && !app.display_name.toLowerCase().includes(q) && !app.description.toLowerCase().includes(q)) {
        return false;
      }
      if (selectedCategory !== 'All' && app.category !== selectedCategory) {
        return false;
      }
      if (selectedPricing !== 'All' && app.pricing !== selectedPricing) {
        return false;
      }
      if (openSourceOnly && !app.open_source) {
        return false;
      }
      return true;
    });
  }, [apps, search, selectedCategory, selectedPricing, openSourceOnly]);

  const PRICING_LABELS: Record<string, string> = {
    free: 'Free',
    freemium: 'Freemium',
    paid: 'Paid',
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 flex-wrap">
        {/* Search */}
        <input
          type="text"
          placeholder="Search MCP apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'All Categories' : cat}
            </option>
          ))}
        </select>

        {/* Pricing filter */}
        <select
          value={selectedPricing}
          onChange={(e) => setSelectedPricing(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        >
          {pricingOptions.map((p) => (
            <option key={p} value={p}>
              {p === 'All' ? 'All Pricing' : (PRICING_LABELS[p] ?? p)}
            </option>
          ))}
        </select>

        {/* Open Source toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={openSourceOnly}
            onChange={(e) => setOpenSourceOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          Open Source Only
        </label>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of{' '}
        <span className="font-semibold text-gray-900">{apps.length}</span> MCP apps
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((app) => (
            <McpAppCard key={app.name} app={app} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No MCP apps found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
}
