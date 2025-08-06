#!/usr/bin/env tsx
import fs from 'fs/promises';
import path from 'path';

import type { ArchestraMcpServerManifest } from '@archestra/types';
import { ArchestraMcpServerManifestSchema } from '@schemas';

import { MCP_SERVERS_EVALUATIONS_DIR } from './paths';

async function transformServerData(data: any, filename: string): Promise<ArchestraMcpServerManifest> {
  try {
    // Transform the data to match the expected schema
    const transformed: any = {
      // DXT manifest required fields
      dxt_version: data.dxt_version || '0.1.0',
      name: data.slug || data.name || filename.replace('.json', ''),
      display_name: data.name || data.title,
      version: data.version || '1.0.0',
      description: data.description || '',
      author: {
        name: data.gitHubOrg || data.author || 'unknown',
      },

      // Server configuration - required for DXT
      server: {
        type: determineServerType(data),
        entry_point: data.entry_point || 'index.js',
        mcp_config: {
          command: data.configForArchestra?.command || 'unknown',
          args: data.configForArchestra?.args || [],
          env: data.configForArchestra?.env || {},
        },
      },

      // Optional DXT fields
      tools: data.tools || [],
      prompts: data.prompts || [],
      keywords: data.keywords || [],
      user_config: data.user_config || {},

      // Archestra-specific extensions
      readme: data.readme || null,
      category: data.category || null,
      quality_score: typeof data.qualityScore === 'number' ? data.qualityScore : null,
      config_for_archestra: {
        oauth: {
          provider: data.configForArchestra?.oauth?.provider || 'none',
          required: data.configForArchestra?.oauth?.required || false,
        },
      },
      github_info: {
        owner: data.gitHubOrg || data.githubOrg || '',
        repo: data.gitHubRepo || data.githubRepo || '',
        url: data.githubUrl || `https://github.com/${data.gitHubOrg || data.githubOrg}/${data.gitHubRepo || data.githubRepo}`,
        name: data.gitHubRepo || data.githubRepo || '',
        path: data.repositoryPath || null,
        stars: data.gh_stars || 0,
        contributors: data.gh_contributors || 0,
        issues: data.gh_issues || 0,
        releases: data.gh_releases || false,
        ci_cd: data.gh_ci_cd || false,
        latest_commit_hash: data.gh_latest_commit_hash || null,
      },
      programming_language: data.programmingLanguage || data.programming_language || 'Unknown',
      framework: data.framework || null,
      last_scraped_at: data.last_scraped_at || null,
      evaluation_model: data.evaluation_model || null,
      protocol_features: {
        implementing_tools: data.implementing_tools || false,
        implementing_prompts: data.implementing_prompts || false,
        implementing_resources: data.implementing_resources || false,
        implementing_sampling: data.implementing_sampling || false,
        implementing_roots: data.implementing_roots || false,
        implementing_logging: data.implementing_logging || false,
        implementing_stdio: data.implementing_stdio || false,
        implementing_streamable_http: data.implementing_streamable_http || false,
        implementing_oauth2: data.implementing_oauth2 || false,
      },
      dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
      raw_dependencies: data.rawDependencies || data.raw_dependencies || null,
    };

    // If there's a score breakdown, add it
    if (data.scoreBreakdown || data.score_breakdown) {
      const breakdown = data.scoreBreakdown || data.score_breakdown;
      transformed.score_breakdown = {
        mcp_protocol: breakdown.mcp_protocol || 0,
        github_metrics: breakdown.github_metrics || 0,
        deployment_maturity: breakdown.deployment_maturity || 0,
        documentation: breakdown.documentation || 0,
        dependencies: breakdown.dependencies || 0,
        badge_usage: breakdown.badge_usage || 0,
        total: breakdown.total || 0,
      };
    }

    // Validate against schema
    const result = ArchestraMcpServerManifestSchema.safeParse(transformed);

    if (!result.success) {
      console.error(`Validation failed for ${filename}:`);
      console.error(JSON.stringify(result.error.format(), null, 2));
      
      // Log the problematic data for debugging
      console.error('\nTransformed data:');
      console.error(JSON.stringify(transformed, null, 2));
      
      throw new Error(`Failed to transform ${filename}`);
    }

    return result.data;
  } catch (error) {
    console.error(`Error transforming ${filename}:`, error);
    throw error;
  }
}

function determineServerType(data: any): 'python' | 'node' | 'binary' {
  const lang = (data.programmingLanguage || data.programming_language || '').toLowerCase();
  
  if (lang.includes('python')) return 'python';
  if (lang.includes('javascript') || lang.includes('typescript') || lang.includes('node')) return 'node';
  
  // Check command for hints
  const command = data.configForArchestra?.command || '';
  if (command.includes('python') || command.includes('pip')) return 'python';
  if (command.includes('node') || command.includes('npm') || command.includes('npx')) return 'node';
  
  // Default to binary for compiled languages or unknown
  return 'binary';
}

async function processFile(filePath: string): Promise<void> {
  const filename = path.basename(filePath);
  console.log(`Processing ${filename}...`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const transformed = await transformServerData(data, filename);

    // Write back the transformed data
    await fs.writeFile(filePath, JSON.stringify(transformed, null, 2) + '\n', 'utf-8');

    console.log(`✓ Successfully transformed ${filename}`);
  } catch (error) {
    console.error(`✗ Failed to process ${filename}:`, error);
    throw error;
  }
}

async function main() {
  console.log('Starting MCP server data transformation...\n');

  try {
    // Get all JSON files in the mcp-evaluations directory
    const files = await fs.readdir(MCP_SERVERS_EVALUATIONS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    console.log(`Found ${jsonFiles.length} JSON files to process\n`);

    let successCount = 0;
    let failureCount = 0;
    const failures: string[] = [];

    // Process each file
    for (const file of jsonFiles) {
      const filePath = path.join(MCP_SERVERS_EVALUATIONS_DIR, file);
      try {
        await processFile(filePath);
        successCount++;
      } catch (error) {
        failureCount++;
        failures.push(file);
      }
    }

    console.log('\n=== Transformation Complete ===');
    console.log(`✓ Successfully transformed: ${successCount} files`);
    console.log(`✗ Failed to transform: ${failureCount} files`);

    if (failures.length > 0) {
      console.log('\nFailed files:');
      failures.forEach(f => console.log(`  - ${f}`));
    }

    if (failureCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the transformation
if (require.main === module) {
  main();
}