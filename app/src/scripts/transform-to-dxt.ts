#!/usr/bin/env tsx
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import type { ArchestraMcpServerManifest } from '@archestra/types';
import { ArchestraMcpServerManifestSchema } from '@schemas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MCP_EVALUATIONS_DIR = path.join(__dirname, 'mcp-evaluations');

async function transformServerData(data: any): Promise<ArchestraMcpServerManifest> {
  // Start with DXT manifest fields
  const transformed: any = {
    // Required DXT manifest fields
    dxt_version: '0.1.0', // DXT version
    name: data.slug || data.name, // Use slug as name (machine-readable identifier)
    title: data.name || data.slug, // Use name as title (human-readable)
    version: data.version || '1.0.0', // Default version if not present
    description: data.description,
    author: data.gitHubOrg || 'unknown', // Use GitHub org as author

    // Server configuration - required for DXT
    server: data.configForArchestra
      ? {
          command: data.configForArchestra.command,
          args: data.configForArchestra.args || [],
          env: data.configForArchestra.env || {},
        }
      : {
          command: 'unknown',
          args: [],
          env: {},
        },

    // Tools - transform from old format if present
    tools:
      data.tools?.map((tool: any) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema || {
          type: 'object',
          properties: {},
        },
      })) || [],

    // Prompts - default to empty if not present
    prompts: data.prompts || [],

    // Resources - not in the old data, but we can default to empty
    // (resources field is part of DXT but not in our extended schema)

    // User config - not present in old data
    user_config: data.user_config || {},

    // Archestra-specific extensions
    readme: data.readme,
    category: data.category,
    qualityScore: data.qualityScore,
    gitHubOrg: data.gitHubOrg,
    gitHubRepo: data.gitHubRepo,
    repositoryPath: data.repositoryPath,
    programmingLanguage: data.programmingLanguage,
    framework: data.framework,
    gh_stars: data.gh_stars,
    gh_contributors: data.gh_contributors,
    gh_issues: data.gh_issues,
    gh_releases: data.gh_releases,
    gh_ci_cd: data.gh_ci_cd,
    gh_latest_commit_hash: data.gh_latest_commit_hash,
    last_scraped_at: data.last_scraped_at,
    evaluation_model: data.evaluation_model,
    implementing_tools: data.implementing_tools,
    implementing_prompts: data.implementing_prompts,
    implementing_resources: data.implementing_resources,
    implementing_sampling: data.implementing_sampling,
    implementing_roots: data.implementing_roots,
    implementing_logging: data.implementing_logging,
    implementing_stdio: data.implementing_stdio,
    implementing_streamable_http: data.implementing_streamable_http,
    implementing_oauth2: data.implementing_oauth2,
    configForArchestra: data.configForArchestra
      ? {
          ...data.configForArchestra,
          oauth: data.configForArchestra.oauth || undefined,
        }
      : null,
    scoreBreakdown: data.scoreBreakdown,
    dependencies: data.dependencies,
    rawDependencies: data.rawDependencies,
  };

  // Remove undefined fields
  Object.keys(transformed).forEach((key) => {
    if (transformed[key] === undefined) {
      delete transformed[key];
    }
  });

  // Validate against schema
  const result = ArchestraMcpServerManifestSchema.safeParse(transformed);

  if (!result.success) {
    console.error(`Validation failed for ${data.slug}:`);
    console.error(result.error.format());
    throw new Error(`Failed to transform ${data.slug}`);
  }

  return result.data;
}

async function processFile(filePath: string): Promise<void> {
  console.log(`Processing ${path.basename(filePath)}...`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const transformed = await transformServerData(data);

    // Write back the transformed data
    await fs.writeFile(filePath, JSON.stringify(transformed, null, 2) + '\n', 'utf-8');

    console.log(`✓ Successfully transformed ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`✗ Failed to process ${path.basename(filePath)}:`, error);
    throw error;
  }
}

async function main() {
  console.log('Starting MCP server data transformation...\n');

  try {
    // Get all JSON files in the mcp-evaluations directory
    const files = await fs.readdir(MCP_EVALUATIONS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    console.log(`Found ${jsonFiles.length} JSON files to process\n`);

    let successCount = 0;
    let failureCount = 0;

    // Process each file
    for (const file of jsonFiles) {
      const filePath = path.join(MCP_EVALUATIONS_DIR, file);
      try {
        await processFile(filePath);
        successCount++;
      } catch (error) {
        failureCount++;
      }
    }

    console.log('\n=== Transformation Complete ===');
    console.log(`✓ Successfully transformed: ${successCount} files`);
    console.log(`✗ Failed to transform: ${failureCount} files`);

    if (failureCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the transformation
main();
