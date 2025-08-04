import { MetadataRoute } from 'next';
import { loadServers } from './mcp-catalog/lib/server-utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://archestra.ai';
  
  // Load all MCP servers for dynamic routes
  const servers = await loadServers();
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/mcp-catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/state-of-mcp`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  ];
  
  // Dynamic MCP server pages
  const serverPages = servers.map((server) => ({
    url: `${baseUrl}/mcp-catalog/${server.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
  
  return [...staticPages, ...serverPages];
}