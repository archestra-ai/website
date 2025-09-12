import {
  DxtManifestSchema,
  DxtManifestServerSchema,
  DxtUserConfigurationOptionSchema,
  McpServerConfigSchema,
} from '@anthropic-ai/dxt';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

/**
 * NOTE! don't remove this, this is super important to get the openapi schema export working correctly
 *
 * See https://github.com/asteasolutions/zod-to-openapi/blob/be536b7128925842c1d41e7ab4fb10e034e71a6e/README.md#example-2---require-syntax
 */
extendZodWithOpenApi(z);

export const McpServerCategorySchema = z.enum([
  'Aggregators',
  'Art & Culture',
  'Healthcare',
  'Browser Automation',
  'Cloud',
  'Development',
  'CLI Tools',
  'Communication',
  'Data',
  'Logistics',
  'Data Science',
  'IoT',
  'File Management',
  'Finance',
  'Gaming',
  'Knowledge',
  'Location',
  'Marketing',
  'Monitoring',
  'Media',
  'AI Tools',
  'Search',
  'Security',
  'Social Media',
  'Sports',
  'Support',
  'Translation',
  'Audio',
  'Travel',
  'Messengers',
  'Email',
  'CRM',
  'Enterprise',
  'Job Search',
  'Local files',
  'General',
]);

export const MCPDependencySchema = z.object({
  name: z.string(),
  importance: z.number().min(1).max(10),
});

export const ArchestraClientConfigPermutationsSchema = z.object({
  mcpServers: z.record(z.string(), McpServerConfigSchema),
});

/**
 * NOTE: when we are ready to add more OAuth providers, we can simply add them here
 * and re-run the `evaluate-catalog.ts` script to have the catalog updated
 */
export const ArchestraSupportedOauthProvidersSchema = z.enum(['google', 'slack', 'linkedin']);

export const ArchestraOauthSchema = z.object({
  provider: ArchestraSupportedOauthProvidersSchema.nullable(),
  required: z.boolean(),
});

export const OauthConfigSchema = z.object({
  name: z.string(),
  server_url: z.string().url(),
  auth_server_url: z.string().url().optional(), // Optional, defaults to server_url
  resource_metadata_url: z.string().url().optional(),
  client_id: z.string(),
  client_secret: z.string().optional(), // Optional for public clients, can contain env var references
  redirect_uris: z.array(z.string().url()),
  scopes: z.array(z.string()),
  description: z.string().optional(),
  well_known_url: z.string().url().optional(), // Optional specific well-known URL for this provider
  default_scopes: z.array(z.string()), // Fallback scopes when discovery fails
  supports_resource_metadata: z.boolean(), // Whether to attempt resource metadata discovery
  generic_oauth: z.boolean().optional(), // Use generic OAuth 2.0 flow instead of MCP SDK
  token_endpoint: z.string().url().optional(), // Token endpoint for generic OAuth
  access_token_env_var: z.string().optional(), // Environment variable name to store access token
  requires_proxy: z.boolean().optional(), // Whether this provider requires oauth-proxy for client secrets
  provider_name: z.string().optional(), // Provider name for token mapping lookup (e.g., 'slack-browser')
  browser_auth: z.boolean().optional(), // Whether this uses browser authentication
  streamable_http_url: z.string().url().optional(), // URL for streamable HTTP MCP servers
  streamable_http_port: z.number().optional(), // Port for streamable HTTP MCP servers
});

export const ArchestraBrowserBasedSchema = z.object({
  required: z.boolean(),
});

export const ArchestraConfigSchema = z.object({
  client_config_permutations: ArchestraClientConfigPermutationsSchema.nullable(),
  oauth: ArchestraOauthSchema,
  browser_based: ArchestraBrowserBasedSchema.optional(),
});

export const ArchestraScoreBreakdownSchema = z.object({
  mcp_protocol: z.number(),
  github_metrics: z.number(),
  deployment_maturity: z.number(),
  documentation: z.number(),
  dependencies: z.number(),
  badge_usage: z.number(),
  total: z.number(),
});

export const ArchestraMcpServerGitHubRepoInfoSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  url: z.string(),
  name: z.string(),
  path: z.string().nullable(),
});

export const ArchestraMcpServerGitHubRepoStatsSchema = z.object({
  stars: z.number(),
  contributors: z.number(),
  issues: z.number(),
  releases: z.boolean(),
  ci_cd: z.boolean(),
  latest_commit_hash: z.string().nullable(),
});

export const ArchestraMcpServerFullGitHubInfoSchema = ArchestraMcpServerGitHubRepoInfoSchema.merge(
  ArchestraMcpServerGitHubRepoStatsSchema
);

export const ArchestraMcpServerProtocolFeaturesSchema = z.object({
  implementing_tools: z.boolean(),
  implementing_prompts: z.boolean(),
  implementing_resources: z.boolean(),
  implementing_sampling: z.boolean(),
  implementing_roots: z.boolean(),
  implementing_logging: z.boolean(),
  implementing_stdio: z.boolean(),
  implementing_streamable_http: z.boolean(),
  implementing_oauth2: z.boolean(),
});

// Base schema for remote servers
const RemoteServerSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  version: z.string(),
  description: z.string(),
  remote_url: z.string().url().optional(),
  remote_mcp_docs_url: z.string().url().optional(),
  oauth_config: OauthConfigSchema.optional(),
  tools: z.array(z.any()).optional(),
  prompts: z.array(z.any()).optional(),
  user_config: z.record(z.string(), z.any()).optional(),
  readme: z.string().nullable(),
  category: McpServerCategorySchema.nullable(),
  quality_score: z.number().min(0).max(100).nullable(),
  archestra_config: ArchestraConfigSchema.nullable().optional(),
  github_info: ArchestraMcpServerFullGitHubInfoSchema.optional(),
  programming_language: z.string().optional(),
  framework: z.string().nullable(),
  last_scraped_at: z.string().nullable(),
  evaluation_model: z.string().nullable(),
  protocol_features: ArchestraMcpServerProtocolFeaturesSchema.optional(),
  dependencies: z.array(MCPDependencySchema).optional(),
  raw_dependencies: z.string().nullable(),
});

// Full DXT-based schema
const FullDxtServerSchema = DxtManifestSchema.omit({ repository: true }).extend({
  /**
   * Machine-readable name (used for CLI, APIs)
   */
  name: z.string(),

  /**
   * Human-friendly name for UI display
   */
  display_name: z.string(),

  /**
   * URL for remote MCP servers. If set, this server is treated as remote.
   */
  remote_url: z.string().url().optional(),

  /**
   * Documentation URL for remote MCP servers.
   */
  remote_mcp_docs_url: z.string().url().optional(),

  readme: z.string().nullable(),
  category: McpServerCategorySchema.nullable(),
  quality_score: z.number().min(0).max(100).nullable(),
  archestra_config: ArchestraConfigSchema.optional(),
  github_info: ArchestraMcpServerFullGitHubInfoSchema.optional(),
  programming_language: z.string().optional(),
  framework: z.string().nullable(),
  last_scraped_at: z.string().nullable(),
  evaluation_model: z.string().nullable(),
  protocol_features: ArchestraMcpServerProtocolFeaturesSchema.optional(),
  dependencies: z.array(MCPDependencySchema).optional(),
  raw_dependencies: z.string().nullable(),
  oauth_config: OauthConfigSchema.optional(),
  server_overridden: DxtManifestServerSchema.optional(),
  server_docker: z.any().optional(),
  user_config_overridden: z.record(z.string(), DxtUserConfigurationOptionSchema).optional(),
});

// Union schema that accepts both formats
const ArchestraMcpServerManifestBase = z.union([RemoteServerSchema, FullDxtServerSchema]);

export const ArchestraMcpServerManifestSchema = ArchestraMcpServerManifestBase.refine(
  (data) => {
    // For full DXT schemas, local servers (no remote_url) require github_info and programming_language
    if ('dxt_version' in data && !data.remote_url && (!data.github_info || !data.programming_language)) {
      return false;
    }
    return true;
  },
  {
    message: 'Local DXT servers require github_info and programming_language',
  }
).openapi('ArchestraMcpServerManifest');

export const ArchestraMcpServerManifestWithScoreBreakdownSchema = z.union([
  RemoteServerSchema.extend({ score_breakdown: ArchestraScoreBreakdownSchema }),
  FullDxtServerSchema.extend({ score_breakdown: ArchestraScoreBreakdownSchema }),
])
  .refine(
    (data) => {
      // For full DXT schemas, local servers (no remote_url) require github_info and programming_language
      if ('dxt_version' in data && !data.remote_url && (!data.github_info || !data.programming_language)) {
        return false;
      }
      return true;
    },
    {
      message: 'Local DXT servers require github_info and programming_language',
    }
  )
  .openapi('ArchestraMcpServerManifestWithScoreBreakdown');
