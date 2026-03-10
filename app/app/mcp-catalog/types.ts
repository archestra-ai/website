import type { z } from 'zod';

import type {
  ArchestraMcpAppManifestSchema,
  ArchestraMcpServerGitHubRepoInfoSchema,
  ArchestraMcpServerManifestSchema,
  ArchestraScoreBreakdownSchema,
  MCPDependencySchema,
  McpAppCategorySchema,
  McpAppPlatformSchema,
  McpAppPricingSchema,
  McpServerCategorySchema,
} from '@mcpCatalog/schemas';

// ─── MCP Server types ─────────────────────────────────────────────────────────
export type McpServerCategory = z.infer<typeof McpServerCategorySchema>;
export type ArchestraScoreBreakdown = z.infer<typeof ArchestraScoreBreakdownSchema>;
export type ArchestraMcpServerGitHubRepoInfo = z.infer<typeof ArchestraMcpServerGitHubRepoInfoSchema>;
export type ArchestraMcpServerManifest = z.infer<typeof ArchestraMcpServerManifestSchema>;
export type MCPDependency = z.infer<typeof MCPDependencySchema>;

// ─── MCP App (Client Application) types ──────────────────────────────────────
export type McpAppCategory = z.infer<typeof McpAppCategorySchema>;
export type McpAppPlatform = z.infer<typeof McpAppPlatformSchema>;
export type McpAppPricing = z.infer<typeof McpAppPricingSchema>;
export type ArchestraMcpApp = z.infer<typeof ArchestraMcpAppManifestSchema>;
