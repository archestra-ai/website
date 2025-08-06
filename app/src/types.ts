import { z } from 'zod';

import {
  ArchestraMcpServerFullGitHubInfoSchema,
  ArchestraMcpServerGitHubRepoInfoSchema,
  ArchestraMcpServerGitHubRepoStatsSchema,
  ArchestraMcpServerManifestSchema,
  ArchestraMcpServerManifestWithScoreBreakdownSchema,
  ArchestraMcpServerProtocolFeaturesSchema,
  ArchestraScoreBreakdownSchema,
  ArchestraServerConfigSchema,
  MCPDependencySchema,
  McpServerCategorySchema,
} from './schemas';

// Infer types from Zod schemas
export type McpServerCategory = z.infer<typeof McpServerCategorySchema>;
export type MCPDependency = z.infer<typeof MCPDependencySchema>;
export type ArchestraServerConfig = z.infer<typeof ArchestraServerConfigSchema>;
export type ArchestraScoreBreakdown = z.infer<typeof ArchestraScoreBreakdownSchema>;
export type ArchestraMcpServerGitHubRepoInfo = z.infer<typeof ArchestraMcpServerGitHubRepoInfoSchema>;
export type ArchestraMcpServerGitHubRepoStats = z.infer<typeof ArchestraMcpServerGitHubRepoStatsSchema>;
export type ArchestraMcpServerFullGitHubInfo = z.infer<typeof ArchestraMcpServerFullGitHubInfoSchema>;
export type ArchestraMcpServerProtocolFeatures = z.infer<typeof ArchestraMcpServerProtocolFeaturesSchema>;
export type ArchestraMcpServerManifest = z.infer<typeof ArchestraMcpServerManifestSchema>;
export type ArchestraMcpServerManifestWithScoreBreakdown = z.infer<
  typeof ArchestraMcpServerManifestWithScoreBreakdownSchema
>;

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  readingTime: string;
  image?: string;
  github?: string;
  cta?: {
    text: string;
    url: string;
  };
}
