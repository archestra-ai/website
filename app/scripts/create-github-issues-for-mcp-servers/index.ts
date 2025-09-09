#!/usr/bin/env npx tsx
import { Octokit } from '@octokit/rest';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

interface CsvRow {
  'Server Name': string;
  'File Name': string;
  'Config Type': string;
  'Docker Permutation Key': string;
  'Install Success': string;
  'Logs Retrieved': string;
  'Ping Success': string;
  Error: string;
  Timestamp: string;
}

interface McpServer {
  name: string;
  display_name: string;
  description: string;
  category: string;
  quality_score: number | null;
  github_info?: {
    owner: string;
    repo: string;
    stars: number;
  };
}

interface ApiResponse {
  servers: McpServer[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const API_BASE_URL = 'https://www.archestra.ai/mcp-catalog/api';
const CSV_FILE_PATH = path.join(__dirname, 'mcp_catalog_audit.csv');
const GITHUB_REPO_OWNER = 'archestra-ai';
const GITHUB_REPO_NAME = 'archestra';
const WEBSITE_REPO_NAME = 'website';

async function readCsvFile(): Promise<Set<string>> {
  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  }) as CsvRow[];

  const brokenServers = new Set<string>();

  for (const row of records) {
    if (row['Install Success'] === 'FALSE') {
      brokenServers.add(row['Server Name']);
    }
  }

  console.log(`Found ${brokenServers.size} broken servers in CSV`);
  return brokenServers;
}

async function fetchServers(sortBy: 'quality' | 'stars', limit: number = 15): Promise<McpServer[]> {
  const url =
    sortBy === 'quality'
      ? `${API_BASE_URL}/search?limit=${limit}`
      : `${API_BASE_URL}/search?sortBy=stars&dir=desc&limit=${limit}`;

  console.log(`Fetching top ${limit} servers by ${sortBy}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch servers: ${response.statusText}`);
  }

  const data = (await response.json()) as ApiResponse;
  return data.servers;
}

function filterBrokenServers(servers: McpServer[], brokenServerNames: Set<string>): McpServer[] {
  return servers.filter((server) => brokenServerNames.has(server.name));
}

function createIssueBody(server: McpServer): string {
  const jsonFileName = `${server.name}.json`;
  const jsonFileUrl = `https://github.com/${GITHUB_REPO_OWNER}/${WEBSITE_REPO_NAME}/tree/main/app/app/mcp-catalog/data/mcp-evaluations/${jsonFileName}`;

  return `**Describe the issue**

The current \`server\` configuration for this MCP server does not work. Trying to install this MCP server in the desktop application is not successful. The server's data can be found at ${jsonFileUrl}

**Definition of done**

You should open a pull request in \`${GITHUB_REPO_OWNER}/${WEBSITE_REPO_NAME}\` which modifies the \`server\` and/or \`user_config\` objects such that you can install the MCP server in the Archestra desktop application.

In the pull request, you should upload a very short video showing that you are able to install the server + make at least one tool call in the chat using one or more tools from the server 😀`;
}

async function checkExistingIssue(octokit: Octokit, title: string): Promise<number | null> {
  try {
    // Search for open issues with the exact title
    const { data: issues } = await octokit.issues.listForRepo({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      state: 'open',
      per_page: 100,
    });

    const existingIssue = issues.find((issue) => issue.title === title);
    return existingIssue ? existingIssue.number : null;
  } catch (error) {
    console.error(`Failed to check for existing issues:`, error);
    return null;
  }
}

async function createGitHubIssue(octokit: Octokit, server: McpServer, dryRun: boolean): Promise<number | null> {
  const title = `[MCP Catalog] Issue with ${server.name}`;
  const body = createIssueBody(server);

  if (dryRun) {
    console.log(`[DRY RUN] Would check for existing issue with title: ${title}`);
    console.log(`[DRY RUN] Would create issue if not exists:`);
    console.log(`  Title: ${title}`);
    console.log(`  Body preview: ${body.substring(0, 200)}...`);
    return null;
  }

  try {
    // Check if an issue with this title already exists
    const existingIssueNumber = await checkExistingIssue(octokit, title);

    if (existingIssueNumber !== null) {
      console.log(`Issue already exists for ${server.name} (issue #${existingIssueNumber}), skipping creation`);
      return existingIssueNumber;
    }

    // Create new issue if it doesn't exist
    const { data: issue } = await octokit.issues.create({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      title,
      body,
    });

    console.log(`Created issue #${issue.number} for ${server.name}`);
    return issue.number;
  } catch (error) {
    console.error(`Failed to create issue for ${server.name}:`, error);
    return null;
  }
}

async function checkExistingBountyComment(octokit: Octokit, issueNumber: number): Promise<boolean> {
  try {
    const { data: comments } = await octokit.issues.listComments({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      issue_number: issueNumber,
      per_page: 100,
    });

    // Check if any comment contains the bounty command
    return comments.some((comment) => comment.body?.includes('/bounty'));
  } catch (error) {
    console.error(`Failed to check for existing bounty comments:`, error);
    return false;
  }
}

async function addBountyComment(octokit: Octokit, issueNumber: number, dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log(`[DRY RUN] Would check for existing bounty comment on issue #${issueNumber}`);
    console.log(`[DRY RUN] Would add bounty comment if not exists`);
    return;
  }

  try {
    // Check if a bounty comment already exists
    const hasBountyComment = await checkExistingBountyComment(octokit, issueNumber);

    if (hasBountyComment) {
      console.log(`Bounty comment already exists on issue #${issueNumber}, skipping`);
      return;
    }

    // Add bounty comment if it doesn't exist
    await octokit.issues.createComment({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      issue_number: issueNumber,
      body: '/bounty 15',
    });

    console.log(`Added bounty comment to issue #${issueNumber}`);
  } catch (error) {
    console.error(`Failed to add bounty comment to issue #${issueNumber}:`, error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const githubToken = process.env.GITHUB_PAT;

  if (!githubToken && !dryRun) {
    console.error('Error: GITHUB_PAT environment variable is required');
    console.error('Usage: GITHUB_PAT=your_token npx tsx scripts/create-mcp-issues.ts');
    console.error('Or use --dry-run flag to test without creating issues');
    process.exit(1);
  }

  if (dryRun) {
    console.log('Running in DRY RUN mode - no issues will be created');
  }

  const octokit = new Octokit({
    auth: githubToken,
  });

  try {
    // Step 1: Read CSV and get broken servers
    const brokenServerNames = await readCsvFile();

    // Step 2: Fetch top servers by quality score
    const topByQuality = await fetchServers('quality', 1);
    const brokenByQuality = filterBrokenServers(topByQuality, brokenServerNames);
    console.log(`Found ${brokenByQuality.length} broken servers in top 15 by quality`);

    // Step 3: Fetch top servers by stars
    const topByStars = await fetchServers('stars', 15);
    // const brokenByStars = filterBrokenServers(topByStars, brokenServerNames);
    const brokenByStars: McpServer[] = [];
    console.log(`Found ${brokenByStars.length} broken servers in top 15 by stars`);

    // Step 4: Create union of both lists (remove duplicates)
    const serverMap = new Map<string, McpServer>();

    for (const server of brokenByQuality) {
      serverMap.set(server.name, server);
    }

    for (const server of brokenByStars) {
      serverMap.set(server.name, server);
    }

    const uniqueBrokenServers = Array.from(serverMap.values());
    console.log(`\nTotal unique broken servers to process: ${uniqueBrokenServers.length}`);

    if (uniqueBrokenServers.length === 0) {
      console.log('No broken servers found in the top lists!');
      return;
    }

    // Step 5: Create issues and add bounties
    console.log('\nCreating GitHub issues...\n');

    for (const server of uniqueBrokenServers) {
      console.log(`Processing ${server.name}...`);

      const issueNumber = await createGitHubIssue(octokit, server, dryRun);

      if (issueNumber !== null) {
        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await addBountyComment(octokit, issueNumber, dryRun);

        // Add another small delay between issues
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log('\n✅ Script completed successfully!');
    console.log(`Processed ${uniqueBrokenServers.length} servers`);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
