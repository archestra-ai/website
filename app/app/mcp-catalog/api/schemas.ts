import { z } from 'zod';

import { ArchestraMcpServerManifestSchema, McpServerCategorySchema } from '@mcpCatalog/schemas';

export const SearchQuerySchema = z.object({
  q: z.string().optional().describe('Search query to filter by name, description, or repository'),
  category: McpServerCategorySchema.optional().describe('Filter by category'),
  language: z.string().optional().describe('Filter by programming language'),
  worksInArchestra: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean().optional())
    .describe('Filter by whether the server is confirmed to work in the Archestra Desktop app'),
  sortBy: z.enum(['quality', 'stars', 'name']).optional().describe('Sort results by field'),
  limit: z.coerce.number().int().positive().max(100).default(20).optional().describe('Number of results to return'),
  offset: z.coerce.number().int().min(0).default(0).optional().describe('Number of results to skip'),
});

export const SearchResponseSchema = z.object({
  servers: z.array(ArchestraMcpServerManifestSchema),
  totalCount: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
  hasMore: z.boolean(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

type SearchQuery = z.infer<typeof SearchQuerySchema>;
type SearchResponse = z.infer<typeof SearchResponseSchema>;
type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
