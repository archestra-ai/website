#!/usr/bin/env tsx
import { type McpServerConfig } from '@anthropic-ai/dxt';
import { createWriteStream } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import type { ArchestraMcpServerManifest } from '@mcpCatalog/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Global variables for configuration
let numberOfServersToEvaluate: number | 'all' = 'all';
let debugMode = false;

interface AuditResult {
  serverName: string;
  fileName: string;
  configType: 'server' | 'server_docker' | 'docker_permutation' | 'none';
  dockerPermutationKey?: string;
  installSuccess: boolean;
  logsRetrieved: boolean;
  pingSuccess: boolean;
  error?: string;
  logs?: string;
  timestamp: string;
}

// API endpoints
const API_BASE = 'http://localhost:54587';
const INSTALL_ENDPOINT = `${API_BASE}/api/mcp_server/install`;
const LOGS_ENDPOINT = (id: string) => `${API_BASE}/mcp_proxy/${id}/logs`;
const DELETE_ENDPOINT = (id: string) => `${API_BASE}/api/mcp_server/${id}`;

// Utility functions
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (debugMode) {
        console.log(`\n[DEBUG] Request: ${options.method || 'GET'} ${url}`);
        if (options.body) {
          console.log('[DEBUG] Request body:', options.body);
        }
      }

      const response = await fetch(url, options);

      if (debugMode) {
        console.log(`[DEBUG] Response status: ${response.status} ${response.statusText}`);
        if (response.headers.get('content-type')?.includes('application/json')) {
          const clonedResponse = response.clone();
          try {
            const responseData = await clonedResponse.json();
            console.log('[DEBUG] Response body:', JSON.stringify(responseData, null, 2));
          } catch (e) {
            // Ignore JSON parse errors in debug logging
          }
        }
      }

      if (response.ok || response.status === 404) {
        return response;
      }
      if (i < maxRetries - 1) {
        await delay(1000 * (i + 1)); // Exponential backoff
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * (i + 1));
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}

// Read and parse MCP evaluation files
async function readEvaluationFiles(): Promise<{ fileName: string; data: ArchestraMcpServerManifest }[]> {
  const evaluationsDir = path.join(__dirname, '../data/mcp-evaluations');
  const files = await fs.readdir(evaluationsDir);
  let jsonFiles = files.filter((f) => f.endsWith('.json'));

  // Apply limit if specified
  if (numberOfServersToEvaluate !== 'all') {
    jsonFiles = jsonFiles.slice(0, numberOfServersToEvaluate);
  }

  const evaluations: { fileName: string; data: ArchestraMcpServerManifest }[] = [];

  for (const fileName of jsonFiles) {
    try {
      const filePath = path.join(evaluationsDir, fileName);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content) as ArchestraMcpServerManifest;
      evaluations.push({ fileName, data });
    } catch (error) {
      console.error(`Failed to read ${fileName}:`, error);
    }
  }

  return evaluations;
}

// Extract server configuration from evaluation data
function extractServerConfig(data: ArchestraMcpServerManifest): {
  config: McpServerConfig | null;
  type: 'server' | 'server_docker' | 'docker_permutation' | 'none';
  dockerPermutationKey?: string;
} {
  // Check for server_docker first (rare case)
  if (data.server_docker) {
    return { config: data.server_docker as McpServerConfig, type: 'server_docker' };
  }

  // Check for standard server config
  if (data.server?.mcp_config) {
    return { config: data.server.mcp_config, type: 'server' };
  }

  // Check for docker permutations in archestra_config
  if (data.archestra_config?.client_config_permutations?.mcpServers) {
    const mcpServers = data.archestra_config.client_config_permutations.mcpServers;
    // Look for keys ending with '-docker'
    for (const [key, value] of Object.entries(mcpServers)) {
      if (key.endsWith('-docker') && value) {
        return {
          config: value,
          type: 'docker_permutation',
          dockerPermutationKey: key,
        };
      }
    }
  }

  return { config: null, type: 'none' };
}

// Sanitize display name to match validation requirements
function sanitizeDisplayName(name: string): string {
  return name.replace(/[^A-Za-z0-9\s-]/g, '-').substring(0, 63);
}

// Install MCP server
async function installMcpServer(
  id: string,
  displayName: string,
  serverConfig: McpServerConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetchWithRetry(INSTALL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        displayName: sanitizeDisplayName(displayName),
        serverConfig,
        userConfigValues: {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return { success: false, error: errorData.error || response.statusText };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Poll logs and check for successful ping
async function pollLogsAndCheckPing(
  id: string,
  maxAttempts = 10
): Promise<{ success: boolean; logs?: string; error?: string }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await delay(2000); // Wait before checking logs

      const response = await fetchWithRetry(`${LOGS_ENDPOINT(id)}?lines=500`);

      if (!response.ok) {
        if (response.status === 404 && attempt < maxAttempts - 1) {
          continue; // Container might not be ready yet
        }
        return { success: false, error: `Failed to get logs: ${response.statusText}` };
      }

      const data = await response.json();
      const logs = data.logs || '';

      // Check for successful ping/pong or other success indicators
      const successIndicators = [
        'ping.*pong',
        'jsonrpc.*2\\.0',
        'method.*ping',
        'result.*pong',
        'Successfully connected',
        'Server started',
        'Listening on',
        'Ready to accept connections',
      ];

      const hasSuccess = successIndicators.some((pattern) => new RegExp(pattern, 'i').test(logs));

      // Check for error indicators
      const errorIndicators = ['error', 'exception', 'failed', 'cannot', 'unable', 'invalid'];

      const hasError = errorIndicators.some((pattern) => new RegExp(pattern, 'i').test(logs));

      if (hasSuccess && !hasError) {
        return { success: true, logs };
      } else if (hasError && attempt >= 3) {
        // Give it a few attempts before declaring failure
        return { success: false, logs, error: 'Error indicators found in logs' };
      }

      // If no clear success/error, continue polling
      if (attempt === maxAttempts - 1) {
        return { success: false, logs, error: 'No clear success indicator found' };
      }
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    }
  }

  return { success: false, error: 'Max polling attempts reached' };
}

// Delete MCP server
async function deleteMcpServer(id: string): Promise<void> {
  try {
    await fetchWithRetry(DELETE_ENDPOINT(id), { method: 'DELETE' });
  } catch (error) {
    console.error(`Failed to delete server ${id}:`, error);
  }
}

// Write results to CSV
async function writeResultsToCsv(results: AuditResult[], outputPath: string): Promise<void> {
  const csvStream = createWriteStream(outputPath);

  // Write CSV header
  csvStream.write(
    'Server Name,File Name,Config Type,Docker Permutation Key,Install Success,Logs Retrieved,Ping Success,Error,Timestamp\n'
  );

  // Write each result
  for (const result of results) {
    const row = [
      result.serverName,
      result.fileName,
      result.configType,
      result.dockerPermutationKey || '',
      result.installSuccess ? 'true' : 'false',
      result.logsRetrieved ? 'true' : 'false',
      result.pingSuccess ? 'true' : 'false',
      result.error ? `"${result.error.replace(/"/g, '""')}"` : '',
      result.timestamp,
    ].join(',');

    csvStream.write(row + '\n');
  }

  csvStream.end();

  return new Promise((resolve, reject) => {
    csvStream.on('finish', resolve);
    csvStream.on('error', reject);
  });
}

// Check if backend is running
async function checkBackendAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/mcp_server`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Wait for user to confirm backend is ready
async function waitForBackendReady(): Promise<void> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Type "ready" when the backend is running: ', (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'ready') {
        resolve();
      } else {
        console.log('You need to type "ready" to continue. Exiting...');
        process.exit(1);
      }
    });
  });
}

// Main audit function
async function auditServerConfigs(): Promise<void> {
  console.log('Starting MCP server configuration audit...');
  if (numberOfServersToEvaluate !== 'all') {
    console.log(`Limiting evaluation to ${numberOfServersToEvaluate} servers\n`);
  } else {
    console.log('Evaluating all servers\n');
  }

  // Check if backend is available
  console.log('Checking backend availability...');
  const backendAvailable = await checkBackendAvailability();

  if (!backendAvailable) {
    console.log('\n❌ Backend is not running!');
    console.log('Please run the following command in the desktop_app directory of the archestra-ai/archestra repo:');
    console.log('  pnpm start\n');
    await waitForBackendReady();

    // Check again
    const stillNotAvailable = !(await checkBackendAvailability());
    if (stillNotAvailable) {
      console.log("\n❌ Backend is still not available. Please make sure it's running and try again.");
      process.exit(1);
    }
  }

  console.log('✓ Backend is available!\n');

  const results: AuditResult[] = [];
  const startTime = Date.now();

  // Read all evaluation files
  console.log('Reading evaluation files...');
  const evaluations = await readEvaluationFiles();
  console.log(`Found ${evaluations.length} evaluation files\n`);

  // Process each evaluation
  for (let i = 0; i < evaluations.length; i++) {
    const { fileName, data } = evaluations[i];
    const serverName = data.name || fileName.replace('.json', '');
    const displayName = data.display_name || serverName;

    console.log(`[${i + 1}/${evaluations.length}] Processing ${serverName}...`);

    const result: AuditResult = {
      serverName,
      fileName,
      configType: 'none',
      installSuccess: false,
      logsRetrieved: false,
      pingSuccess: false,
      timestamp: new Date().toISOString(),
    };

    try {
      // Extract server configuration
      const { config, type, dockerPermutationKey } = extractServerConfig(data);
      result.configType = type;
      result.dockerPermutationKey = dockerPermutationKey;

      if (!config) {
        result.error = 'No server configuration found';
        results.push(result);
        console.log(`  ❌ No server configuration found`);
        continue;
      }

      // Install the server
      console.log(`  Installing server (${type})...`);
      const installResult = await installMcpServer(serverName, displayName, config);

      if (!installResult.success) {
        result.error = installResult.error;
        results.push(result);
        console.log(`  ❌ Installation failed: ${installResult.error}`);
        continue;
      }

      result.installSuccess = true;
      console.log(`  ✓ Installation successful`);

      // Poll logs and check for ping
      console.log(`  Checking logs...`);
      const logsResult = await pollLogsAndCheckPing(serverName);

      result.logsRetrieved = !!logsResult.logs;
      result.pingSuccess = logsResult.success;
      result.logs = logsResult.logs;

      if (!logsResult.success) {
        result.error = logsResult.error;
        console.log(`  ❌ Validation failed: ${logsResult.error}`);
      } else {
        console.log(`  ✓ Server validated successfully`);
      }

      // Clean up - delete the server
      console.log(`  Cleaning up...`);
      await deleteMcpServer(serverName);
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      console.log(`  ❌ Error: ${result.error}`);
    }

    results.push(result);
    console.log('');

    // Add a small delay between servers to avoid overwhelming the system
    if (i < evaluations.length - 1) {
      await delay(1000);
    }
  }

  // Write results to CSV
  const outputPath = path.join(__dirname, `audit-results-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`);
  console.log(`\nWriting results to ${outputPath}...`);
  await writeResultsToCsv(results, outputPath);

  // Print summary
  const duration = Math.round((Date.now() - startTime) / 1000);
  const successful = results.filter((r) => r.pingSuccess).length;
  const failed = results.filter((r) => !r.pingSuccess).length;
  const noConfig = results.filter((r) => r.configType === 'none').length;

  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Total servers audited: ${results.length}`);
  console.log(`Successful validations: ${successful} (${((successful / results.length) * 100).toFixed(1)}%)`);
  console.log(`Failed validations: ${failed} (${((failed / results.length) * 100).toFixed(1)}%)`);
  console.log(`No configuration found: ${noConfig}`);
  console.log(`Total duration: ${duration} seconds`);
  console.log(`Results saved to: ${outputPath}`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`🔍 MCP Server Configuration Audit Script

This script audits MCP server configurations by attempting to install and validate each server.

Usage: tsx app/mcp-catalog/scripts/audit-server-configs.ts [options]

Options:
  --number-of-servers-to-evaluate <n|all>  Number of servers to evaluate (default: all)
  --debug                                  Enable debug mode to log all HTTP requests/responses
  --help, -h                               Show this help message

Examples:
  # Audit all servers
  tsx app/app/mcp-catalog/scripts/audit-server-configs.ts

  # Audit only the first 10 servers
  tsx app/app/mcp-catalog/scripts/audit-server-configs.ts --number-of-servers-to-evaluate 10

  # Audit with debug logging
  tsx app/app/mcp-catalog/scripts/audit-server-configs.ts --debug

Output:
  The script generates a CSV file with audit results including:
  - Server installation success/failure
  - Log retrieval status
  - JSONRPC ping validation
  - Error messages for failed servers

Prerequisites:
  The Archestra desktop app backend must be running on localhost:54587.
  If not running, the script will prompt you to start it.`);
    return;
  }

  // Parse debug flag
  if (args.includes('--debug')) {
    debugMode = true;
    console.log('Debug mode enabled');
  }

  // Parse number of servers
  const numberOfServersIndex = args.indexOf('--number-of-servers-to-evaluate');
  if (numberOfServersIndex !== -1 && args[numberOfServersIndex + 1]) {
    const value = args[numberOfServersIndex + 1];
    if (value !== 'all') {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed) && parsed > 0) {
        numberOfServersToEvaluate = parsed;
      } else {
        console.error('❌ Invalid value for --number-of-servers-to-evaluate. Must be a positive number or "all".');
        process.exit(1);
      }
    }
  }

  // Run the audit
  try {
    await auditServerConfigs();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
