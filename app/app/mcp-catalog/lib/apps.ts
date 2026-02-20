import fs from 'fs';
import path from 'path';

import { ArchestraMcpApp } from '@mcpCatalog/types';

const DATA_DIR = path.join(process.cwd(), './app/mcp-catalog/data');
const MCP_APPS_JSON_FILE_PATH = path.join(DATA_DIR, 'mcp-apps.json');

// Simple in-memory cache
let appsCache: ArchestraMcpApp[] | null = null;

/** Clear the apps cache (useful in development) */
export function clearAppsCache(): void {
  appsCache = null;
}

/** Load all MCP client apps from mcp-apps.json */
export function loadApps(): ArchestraMcpApp[] {
  if (appsCache) {
    return appsCache;
  }

  try {
    const content = fs.readFileSync(MCP_APPS_JSON_FILE_PATH, 'utf-8');
    const apps = JSON.parse(content) as ArchestraMcpApp[];

    // Sort: open-source first, then alphabetically by display name
    appsCache = apps.sort((a, b) => {
      if (a.open_source !== b.open_source) {
        return a.open_source ? -1 : 1;
      }
      return a.display_name.localeCompare(b.display_name);
    });

    return appsCache;
  } catch (error) {
    console.error('Failed to load mcp-apps.json:', error);
    return [];
  }
}

/** Get unique categories from apps, sorted by count */
export function getAppCategories(apps: ArchestraMcpApp[]): string[] {
  const counts = new Map<string, number>();

  for (const app of apps) {
    counts.set(app.category, (counts.get(app.category) ?? 0) + 1);
  }

  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([cat]) => cat);

  return ['All', ...sorted];
}

/** Get unique pricing options present in apps */
export function getAppPricingOptions(apps: ArchestraMcpApp[]): string[] {
  const seen = new Set<string>();
  for (const app of apps) {
    seen.add(app.pricing);
  }
  const order = ['free', 'freemium', 'paid'];
  const sorted = order.filter((p) => seen.has(p));
  return ['All', ...sorted];
}
