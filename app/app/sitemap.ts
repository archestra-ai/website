import { MetadataRoute } from 'next';

import constants from '@constants';
import { loadServers } from '@mcpCatalog/lib/catalog';
import { generateMcpCatalogDetailPageUrl } from '@mcpCatalog/lib/urls';

import { cachedGetAvailableDates, cachedGetChannels, cachedGetThreadsForSitemap } from './community-stream/db/cache';

// Regenerate sitemap every 10 minutes
export const revalidate = 600;

const {
  base: websiteBaseUrl,
  mcpCatalog: websiteMcpCatalogUrl,
  about: websiteAboutUrl,
  stateOfMcp: websiteStateOfMcpUrl,
} = constants.website.urls;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Load all MCP servers for dynamic routes
  const servers = loadServers();

  // Static pages
  const staticPages = [
    {
      url: websiteBaseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: websiteMcpCatalogUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: websiteAboutUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: websiteStateOfMcpUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Dynamic MCP server pages
  const serverPages = servers.map((server) => ({
    url: generateMcpCatalogDetailPageUrl(server.name),
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Community stream pages
  let communityPages: MetadataRoute.Sitemap = [];
  try {
    const channels = await cachedGetChannels();

    // Date-based pages for each channel
    const datePages: MetadataRoute.Sitemap = [];
    for (const ch of channels) {
      const dates = await cachedGetAvailableDates(ch.id);
      for (const date of dates) {
        datePages.push({
          url: `${websiteBaseUrl}/community-stream/${ch.name}/${date}`,
          lastModified: new Date(date + 'T23:59:59.000Z'),
          changeFrequency: 'weekly' as const,
          priority: 0.5,
        });
      }
    }

    // Thread pages (still valuable — unique content with replies)
    const threads = await cachedGetThreadsForSitemap();
    const threadPages = threads.map((t) => ({
      url: `${websiteBaseUrl}/community-stream/${t.channelName}/${t.ts}`,
      lastModified: new Date(t.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    }));

    communityPages = [...datePages, ...threadPages];
  } catch {
    // DB may not be available at build time
  }

  return [...staticPages, ...serverPages, ...communityPages];
}
