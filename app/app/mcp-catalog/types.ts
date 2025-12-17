import { z } from 'zod';

import {
  ArchestraMcpServerGitHubRepoInfoSchema,
  ArchestraMcpServerManifestSchema,
  ArchestraScoreBreakdownSchema,
  McpServerCategorySchema,
} from '@mcpCatalog/schemas';

// Infer types from Zod schemas
export type McpServerCategory = z.infer<typeof McpServerCategorySchema>;
export type ArchestraScoreBreakdown = z.infer<typeof ArchestraScoreBreakdownSchema>;
export type ArchestraMcpServerGitHubRepoInfo = z.infer<typeof ArchestraMcpServerGitHubRepoInfoSchema>;
export type ArchestraMcpServerManifest = z.infer<typeof ArchestraMcpServerManifestSchema>;
