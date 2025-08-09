import { MetadataRoute } from 'next';

import constants from '@constants';
import { loadServers } from '@mcpCatalog/lib/catalog';
import { generateMcpCatalogDetailPageUrl } from '@mcpCatalog/lib/urls';

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

  return [...staticPages, ...serverPages];
}
