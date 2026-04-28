import { MetadataRoute } from 'next';

import constants from '@constants';
import { loadServers } from '@mcpCatalog/lib/catalog';
import { generateMcpCatalogDetailPageUrl } from '@mcpCatalog/lib/urls';

import { getAllPosts } from './blog/utils';
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
  const servers = loadServers();
  const posts = getAllPosts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: websiteBaseUrl, lastModified: new Date() },
    { url: websiteMcpCatalogUrl, lastModified: new Date() },
    { url: websiteAboutUrl, lastModified: new Date() },
    { url: websiteStateOfMcpUrl, lastModified: new Date() },
    { url: `${websiteBaseUrl}/blog`, lastModified: new Date() },
    { url: `${websiteBaseUrl}/careers`, lastModified: new Date() },
    { url: `${websiteBaseUrl}/community-stream`, lastModified: new Date() },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${websiteBaseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  const serverPages: MetadataRoute.Sitemap = servers.map((server) => ({
    url: generateMcpCatalogDetailPageUrl(server.name),
    lastModified: server.last_scraped_at ? new Date(server.last_scraped_at) : new Date(),
  }));

  let communityPages: MetadataRoute.Sitemap = [];
  try {
    const channels = await cachedGetChannels();

    const datePages: MetadataRoute.Sitemap = [];
    for (const ch of channels) {
      const dates = await cachedGetAvailableDates(ch.id);
      for (const date of dates) {
        datePages.push({
          url: `${websiteBaseUrl}/community-stream/${ch.name}/${date}`,
          lastModified: new Date(date + 'T23:59:59.000Z'),
        });
      }
    }

    const threads = await cachedGetThreadsForSitemap();
    const threadPages: MetadataRoute.Sitemap = threads.map((t) => ({
      url: `${websiteBaseUrl}/community-stream/${t.channelName}/${t.ts}`,
      lastModified: new Date(t.createdAt),
    }));

    communityPages = [...datePages, ...threadPages];
  } catch {
    // DB may not be available at build time
  }

  return [...staticPages, ...blogPages, ...serverPages, ...communityPages];
}
