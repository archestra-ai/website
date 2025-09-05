#!/usr/bin/env tsx

/**
 * MCP Protocol Features Detection Script
 * 
 * This script provides pattern-based analysis of MCP server repositories to detect
 * which protocol features are implemented.
 * 
 * Features:
 * - Pattern-based detection of MCP protocol features
 * - Git-based repository cloning and analysis
 * - Optional GitHub API validation with rate limiting
 * - Retry logic with exponential backoff for API calls
 * - Comprehensive MCP feature detection (tools, prompts, resources, etc.)
 */

const { execFile } = require("child_process");
const fs = require("fs");
const fsp = fs.promises;
const os = require("os");
const path = require("path");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

type Dirent = import("node:fs").Dirent;

// ============= GitHub API Rate Limiting Utilities =============

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper for GitHub API calls with rate limiting and retry logic
 */
async function githubApiCall(endpoint: string, returnHeaders = false) {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'MCP-Features-Analyzer',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers,
  });

  if (!response.ok) {
    if (response.status === 403 && response.statusText.includes('rate limit')) {
      throw new Error('RATE_LIMITED');
    }
    if (response.status === 404) {
      throw new Error(`REPO_NOT_FOUND: ${response.status}`);
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  if (returnHeaders) {
    return { data, headers: response.headers };
  }
  return data;
}

/**
 * Execute GitHub API call with retry logic and rate limiting
 */
async function executeWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      return await apiCall();
    } catch (error: any) {
      if (error.message === 'RATE_LIMITED' && retryCount < maxRetries) {
        retryCount++;
        const waitTime = Math.min(60000 * retryCount, 180000); // Exponential backoff, max 3 minutes
        console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry...`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Failed after ${maxRetries} retries`);
}

/**
 * Validate GitHub repository exists and is accessible via API
 */
async function validateGitHubRepo(url: string): Promise<{ owner: string; repo: string; exists: boolean }> {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error(`Invalid GitHub URL: ${url}`);
    }

    const [, owner, repo] = match;

    // Check if repository exists via GitHub API
    await executeWithRetry(() => githubApiCall(`/repos/${owner}/${repo}`));

    return { owner, repo, exists: true };
  } catch (error: any) {
    if (error.message.startsWith('REPO_NOT_FOUND:')) {
      return { owner: '', repo: '', exists: false };
    }
    throw error;
  }
}

/**
 * Check GitHub API rate limit status
 */
async function checkRateLimitStatus(): Promise<{
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}> {
  try {
    const response = await executeWithRetry(() => githubApiCall('/rate_limit', true));
    const rateLimit = response.headers.get('x-ratelimit-limit');
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');
    const used = response.headers.get('x-ratelimit-used');

    return {
      limit: parseInt(rateLimit || '0'),
      remaining: parseInt(remaining || '0'),
      reset: parseInt(reset || '0'),
      used: parseInt(used || '0'),
    };
  } catch (error: any) {
    console.warn('Failed to check rate limit status:', error.message);
    return { limit: 0, remaining: 0, reset: 0, used: 0 };
  }
}

// ============= Heuristic patterns =============
// Keep patterns conservative; all matches are case-insensitive.

const PAT_MCP_SDK = [
  // JS/TS + Python SDKs
  String.raw`@modelcontextprotocol\/`, // MCP package import decorator
  String.raw`\bfrom\s+mcp\.server\b`, // Python import from mcp.server
  String.raw`\bimport\s+mcp\.server\b`, // Python import mcp.server
  String.raw`\bfrom\s+mcp\b`, // Python import from mcp
  String.raw`\bimport\s+mcp\b`, // Python import mcp
  String.raw`\bfastmcp\b`, // FastMCP framework reference
  String.raw`\bcrate\s*=\s*"mcp"`, // Rust Cargo.toml dependency

  // MCP method/route names (language-agnostic, code-only)
  String.raw`\binitialize\b`, // MCP initialize method
  String.raw`\btools\/list\b`, // Tools list endpoint
  String.raw`\bprompts\/list\b`, // Prompts list endpoint
  String.raw`\bresources\/list\b`, // Resources list endpoint
  String.raw`\bresources\/templates\/list\b`, // Resource templates endpoint
  String.raw`\bnotifications\/logMessage\b`, // Log message notification
  String.raw`\bcompletions?\b`, // weak hint

  // Go/Cobra CLI wiring for an "mcp" subcommand
  String.raw`\bUse:\s*"mcp"\b`, // Cobra command usage string
  String.raw`\bcobra\.Command\b`, // Cobra command definition
  String.raw`\bAddCommand\([^)]*mcp[^)]*\)`, // Adding MCP subcommand
  String.raw`--stdio\b`, // STDIO transport flag
  String.raw`--host\b`, // Host flag for HTTP transport
  String.raw`--port\b`, // Port flag for HTTP transport
];

const PAT_TOOLS = [
  // Canonical
  String.raw`\btools\/list\b`,
  String.raw`\btools\/call\b`,

  // Python
  String.raw`@mcp\.tool\b`, // MCP tool decorator
  String.raw`\bmcp\.tool\(`, // MCP tool function call

  // TS/JS helpers
  String.raw`\b(add|register|define)[_\-]?tool(s)?\s*\(`, // Tool registration functions
  String.raw`\bdefineTool(s)?\b`, // Define tool function
  String.raw`\bregisterTool(s)?\b`, // Register tool function
  String.raw`\baddTool(s)?\b`, // Add tool function

  // Go-ish
  String.raw`\bTools(List|Call)\b`, // Go-style tool methods
  String.raw`\b(Call|List)Tool(s)?\b`, // Go-style tool functions

  // Weak catch-all
  String.raw`\btools\s*[:=]\s*\[`, // Tools array assignment
];

const PAT_PROMPTS = [
  // Canonical
  String.raw`\bprompts\/list\b`,
  String.raw`\bprompts\/get\b`,

  // Python
  String.raw`@mcp\.prompt\b`, // MCP prompt decorator
  String.raw`\bmcp\.prompt\(`, // MCP prompt function call

  // TS/JS
  String.raw`\b(add|register|define)[_\-]?prompt(s)?\s*\(`, // Prompt registration functions
  String.raw`\bprompts\s*[:=]\s*\[`, // Prompts array assignment

  // Go-ish
  String.raw`\bPrompts(List|Get)\b`,
];

const PAT_RESOURCES = [
  // Canonical
  String.raw`\bresources\/list\b`,
  String.raw`\bresources\/read\b`,
  String.raw`\bresources\/templates\/list\b`,
  String.raw`\bresources\/subscribe\b`,
  String.raw`\bnotifications\/resources\/(updated|list_changed)\b`, // Resource change notifications

  // Python
  String.raw`@mcp\.resource\b`, // MCP resource decorator
  String.raw`\bmcp\.resource\(`, // MCP resource function call

  // TS/JS helpers
  String.raw`\b(add|register|define)[_\-]?resource(s)?\s*\(`, // Resource registration functions
  String.raw`\bdefineResource(s)?\b`, // Define resource function
  String.raw`\bregisterResource(s)?\b`, // Register resource function
  String.raw`\baddResource(s)?\b`, // Add resource function

  // Go-ish
  String.raw`\bResources(List|Read|Subscribe)\b`, // Go-style resource methods

  // Weak
  String.raw`\bresourceTemplates?\s*[:=]\s*\[`, // Resource templates array
];

// -------- MCP client sampling & completion utility (per spec) --------
const PAT_SAMPLING_MCP = [
  // Capability announcement during initialization
  String.raw`"capabilities"\s*:\s*{[^}]*"sampling"\s*:\s*{`, // Sampling capability in JSON
  String.raw`\bsampling\s*"\s*:\s*{`, // Sampling capability field

  // JSON-RPC method
  String.raw`\bsampling\/createMessage\b`, // Sampling create message method
  String.raw`"method"\s*:\s*"sampling\/createMessage"`, // Sampling method in JSON-RPC

  // Common request/response fields
  String.raw`"modelPreferences"\s*:`, // Model preferences field
  String.raw`"hints"\s*:\s*\[`, // Hints array field
  String.raw`"(cost|speed|intelligence)Priority"\s*:\s*`, // Priority fields
  String.raw`"systemPrompt"\s*:`, // System prompt field
  String.raw`"maxTokens"\s*:`, // Max tokens field
  String.raw`"stopReason"\s*:`, // Stop reason field
  // message content types
  String.raw`"content"\s*:\s*{\s*"type"\s*:\s*"(text|image|audio)"`, // Content type field
];

const PAT_COMPLETION_UTILITY = [
  // Capability
  String.raw`"capabilities"\s*:\s*{[^}]*"completions"\s*:\s*{`, // Completions capability in JSON

  // JSON-RPC method
  String.raw`\bcompletion\/complete\b`, // Completion method
  String.raw`"method"\s*:\s*"completion\/complete"`, // Completion method in JSON-RPC

  // Reference types and payload shape
  String.raw`"ref"\s*:\s*{\s*"type"\s*:\s*"ref\/(prompt|resource)"`, // Reference type field
  String.raw`"argument"\s*:\s*{\s*"name"\s*:\s*`, // Argument name field
  String.raw`"completion"\s*:\s*{\s*"values"\s*:\s*\[`, // Completion values array
  String.raw`"hasMore"\s*:\s*(true|false)`, // Has more flag
  String.raw`"total"\s*:\s*\d+`, // Total count field
];

const PAT_LOGGING_ROUTES = [
  String.raw`["'\`]logging\/setLevel["'\`]`, // Logging set level route
  String.raw`["'\`]notifications\/message["'\`]`, // Message notification route
];

const PAT_LOGGING_GO = [
  String.raw`\bLoggingMessage(Notification|Params|Level)\b`, // Go logging message types
  String.raw`\bNewLoggingMessage(Notification|Params)\b`, // Go logging message constructors
  String.raw`\bSetLoggingLevel(Request|Params)?\b`, // Go logging level setter
];

const PAT_LOGGING_TS = [
  String.raw`\bonLogMessage\b`, // TypeScript log message handler
  String.raw`\bsetLoggingLevel\b`, // TypeScript logging level setter
  String.raw`\blogging\s*:\s*{`, // TypeScript logging configuration
];

const PAT_LOGGING_PY = [
  String.raw`\bon_log_message\b`, // Python log message handler
  String.raw`\bset_logging_level\b`, // Python logging level setter
  String.raw`\blogging\s*=\s*`, // Python logging configuration
];

const PAT_LOGGING_CAP = [
  String.raw`\bserverCapabilities\.logging\b`, // Server logging capabilities
  String.raw`\bcapabilities\.logging\b`, // Client logging capabilities
];

const PAT_STDIO = [
  String.raw`\bstdio\b`, // STDIO transport reference
  String.raw`\bprocess\.stdin\b|\bprocess\.stdout\b`, // Node.js STDIO
  String.raw`\bsys\.stdin\b|\bsys\.stdout\b`, // Python STDIO
  String.raw`\bos\.Stdin\b`, // Go STDIO
  String.raw`\bos\.Stdout\b`, // Go STDIO
  String.raw`bufio\.NewReader\(\s*os\.Stdin\s*\)`, // Go STDIO reader
  String.raw`bufio\.NewWriter\(\s*os\.Stdout\s*\)`, // Go STDIO writer
  String.raw`json\.NewDecoder\(\s*os\.Stdin\s*\)`, // Go JSON STDIO decoder
  String.raw`json\.NewEncoder\(\s*os\.Stdout\s*\)`, // Go JSON STDIO encoder
];

const PAT_HTTP = [
  // Python web
  String.raw`\bfastapi\b|\bflask\b|\baiohttp\b|\buvicorn\b`, // Python web frameworks
  // Node
  String.raw`\bexpress\(\)|\bfastify\b|\bkoa\b|\bhono\b`, // Node.js web frameworks
  String.raw`\bhttp\.createServer\b`, // Node.js HTTP server
  // Go
  String.raw`\b"net/http"\b`, // Go HTTP package import
  String.raw`\bnet/http\b`, // Go HTTP package usage
  String.raw`http\.ListenAndServe\b`, // Go HTTP server
  String.raw`http\.Handle(Func)?\b`, // Go HTTP handlers
  // SSE hints
  String.raw`\btext\/event\-stream\b|\bStreamable\b`, // Server-Sent Events content type
  String.raw`\bServer\-Sent\s*Events\b|\bSSE\b`, // Server-Sent Events references
];

const PAT_OAUTH2 = [
  String.raw`\boauth2\b|\bOAuth2\b`, // OAuth2 references
  String.raw`\bWWW-Authenticate\b`, // HTTP authentication header
  String.raw`\bresource_metadata\b`, // OAuth2 resource metadata
  String.raw`\bAuthorizationCodeBearer\b|\bOpenID\b`, // OAuth2 flow types
];

const PAT_ROOTS_CAP = [
  String.raw`"capabilities"\s*:\s*{[^}]*"roots"\s*:\s*{`, // Roots capability in JSON
  String.raw`"listChanged"\s*:\s*(true|false)`, // List changed flag
];

const PAT_ROOTS_METHODS = [
  String.raw`\broots\/list\b`, // Roots list endpoint
  String.raw`\bnotifications\/roots\/list_changed\b`, // Roots change notification
];

const PAT_ROOTS_PAYLOAD = [
  String.raw`"roots"\s*:\s*\[`, // Roots array field
  String.raw`"uri"\s*:\s*"`, // Root URI field
  String.raw`"name"\s*:\s*"`, // Root name field
];

const SCAN_EXTS = new Set<string>([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".py",
  ".go",
  ".rs",
  ".json",
  ".toml",
  ".yml",
  ".yaml",
]);

type RepoResult = {
  name: string;
  tools: boolean;
  prompts: boolean;
  resources: boolean;
  sampling: boolean; // telemetry sampling / completion utility
  roots: boolean;
  logging: boolean;
  stdio: boolean;
  http: boolean;
  oauth2: boolean;
  mcp_like: boolean;
};

function repoNameFromUrl(u: string): string {
  const seg = u.replace(/\/+$/, "").split("/").pop();
  return seg || "unknown-repo";
}

async function chmodTree(root: string): Promise<void> {
  try {
    const st = await fsp.stat(root);
    if (st.isDirectory()) {
      const entries = await fsp.readdir(root);
      await Promise.all(entries.map((e: string) => chmodTree(path.join(root, e))));
    }
    await fsp.chmod(root, 0o666);
  } catch { }
}

async function ensureCloned(url: string, baseDir: string): Promise<string> {
  const name = repoNameFromUrl(url);
  const target = path.join(baseDir, name);
  try {
    const gitDir = path.join(target, ".git");
    if (fs.existsSync(gitDir)) {
      return target;
    }
    await fsp.mkdir(baseDir, { recursive: true });
    await execFileAsync("git", ["clone", "--depth", "1", url, target], {
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
      stdio: "ignore" as any,
    });
  } catch (ex) {
    console.error(`[clone] failed for ${url}: ${String(ex)}`);
  }
  return target;
}

async function* iterFiles(root: string): AsyncGenerator<string> {
  const stack: string[] = [root];
  while (stack.length) {
    const cur = stack.pop()!;
    let dirents: Dirent[];
    try {
      dirents = await fsp.readdir(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const de of dirents) {
      const p = path.join(cur, de.name);
      if (de.isDirectory()) {
        stack.push(p);
      } else if (de.isFile() && SCAN_EXTS.has(path.extname(p).toLowerCase())) {
        yield p;
      }
    }
  }
}

function scanTextForAny(text: string, patterns: string[]): boolean {
  return patterns.some((pat) => new RegExp(pat, "im").test(text));
}

function stripLineComments(text: string, suffix: string): string {
  if ([".ts", ".tsx", ".js", ".mjs", ".cjs", ".go"].includes(suffix)) {
    // //... and  *//* ... *//*  (quick & dirty)
    text = text.replace(/\/\/.*$/gim, "");
    text = text.replace(/\/\*[\s\S]*?\*\//gim, "");
  } else if (suffix === ".py") {
    text = text.replace(/#.*$/gim, "");
  }
  return text;
}

function samplingMcpHit(text: string): boolean {
  return scanTextForAny(text, PAT_SAMPLING_MCP) || scanTextForAny(text, PAT_COMPLETION_UTILITY);
}

function isMcpPromptsFile(text: string): boolean {
  const hasPromptSignal = PAT_PROMPTS.some((p) => new RegExp(p, "im").test(text));
  if (!hasPromptSignal) return false;
  return scanTextForAny(text, PAT_MCP_SDK);
}

function isMcpResourcesFile(text: string): boolean {
  return scanTextForAny(text, PAT_RESOURCES) && scanTextForAny(text, PAT_MCP_SDK);
}

function isMcpToolsFile(text: string): boolean {
  const hasTools = scanTextForAny(text, PAT_TOOLS);
  if (!hasTools) return false;
  return scanTextForAny(text, PAT_MCP_SDK);
}

function isMcpLoggingFile(text: string): boolean {
  if (scanTextForAny(text, PAT_LOGGING_ROUTES)) return true;
  const hasCapHint = scanTextForAny(text, PAT_LOGGING_CAP) || scanTextForAny(text, PAT_LOGGING_ROUTES);
  if (!hasCapHint) return false;
  return scanTextForAny(text, PAT_LOGGING_GO) || scanTextForAny(text, PAT_LOGGING_TS) || scanTextForAny(text, PAT_LOGGING_PY);
}

function hasRootsStrings(text: string): boolean {
  return (
    scanTextForAny(text, PAT_ROOTS_METHODS) ||
    scanTextForAny(text, PAT_ROOTS_CAP) ||
    scanTextForAny(text, PAT_ROOTS_PAYLOAD)
  );
}

async function scanRepo(repoDir: string): Promise<RepoResult> {
  const res: RepoResult = {
    name: path.basename(repoDir),
    tools: false,
    prompts: false,
    resources: false,
    sampling: false,
    roots: false,
    logging: false,
    stdio: false,
    http: false,
    oauth2: false,
    mcp_like: false,
  };

  for await (const fp of iterFiles(repoDir)) {
    let raw: Buffer;
    try {
      raw = await fsp.readFile(fp);
    } catch {
      continue;
    }
    let text = raw.toString("utf8");
    const ext = path.extname(fp).toLowerCase();
    text = stripLineComments(text, ext);

    // Broad MCP presence (SDK OR method names OR CLI hints)
    if (!res.mcp_like && scanTextForAny(text, PAT_MCP_SDK)) res.mcp_like = true;

    // Feature heuristics
    if (!res.tools && isMcpToolsFile(text)) res.tools = true;
    if (!res.prompts && isMcpPromptsFile(text)) res.prompts = true;
    if (!res.resources && isMcpResourcesFile(text)) res.resources = true;

    // Sampling / completion utility
    if (!res.sampling && samplingMcpHit(text)) res.sampling = true;

    if (!res.logging && isMcpLoggingFile(text)) res.logging = true;
    if (!res.stdio && scanTextForAny(text, PAT_STDIO)) res.stdio = true;
    if (!res.http && scanTextForAny(text, PAT_HTTP)) res.http = true;
    if (!res.oauth2 && scanTextForAny(text, PAT_OAUTH2)) res.oauth2 = true;

    if (!res.roots && hasRootsStrings(text)) {
      if (res.mcp_like || scanTextForAny(text, PAT_MCP_SDK)) res.roots = true;
    }

    // If any feature fired, consider MCP-like
    if (
      res.tools ||
      res.prompts ||
      res.resources ||
      res.sampling ||
      res.logging ||
      res.stdio ||
      res.http ||
      res.oauth2 ||
      res.roots
    ) {
      res.mcp_like = true;
    }
  }

  return res;
}

export async function extractProtocolFeaturesFromUrl(
  githubUrl: string,
  repositoryPath: string | null = null,
  options: {
    validateRepo?: boolean; // Whether to validate repository via GitHub API before cloning
    maxRetries?: number;    // Maximum retry attempts for API calls
  } = {}
): Promise<{
  implementing_tools: boolean;
  implementing_prompts: boolean;
  implementing_resources: boolean;
  implementing_sampling: boolean;
  implementing_roots: boolean;
  implementing_logging: boolean;
  implementing_stdio: boolean;
  implementing_streamable_http: boolean;
  implementing_oauth2: boolean;
}> {
  const { validateRepo = false, maxRetries = 3 } = options;

  // Create temp workspace
  const tmpRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "mcp_repos_"));
  const reposDir = path.join(tmpRoot, "repos");
  await fsp.mkdir(reposDir, { recursive: true });

  const name = repoNameFromUrl(githubUrl);

  // Optionally validate repository via GitHub API
  if (validateRepo) {
    try {
      console.log(`Validating repository: ${githubUrl}`);
      const validation = await validateGitHubRepo(githubUrl);
      if (!validation.exists) {
        console.error(`Repository not found: ${githubUrl}`);
        // Return default values if repository doesn't exist
        return {
          implementing_tools: false,
          implementing_prompts: false,
          implementing_resources: false,
          implementing_sampling: false,
          implementing_roots: false,
          implementing_logging: false,
          implementing_stdio: false,
          implementing_streamable_http: false,
          implementing_oauth2: false,
        };
      }
      console.log(`Repository validated: ${validation.owner}/${validation.repo}`);
    } catch (error: any) {
      if (error.message === 'RATE_LIMITED') {
        console.warn(`Rate limited during validation, proceeding with clone: ${error.message}`);
      } else {
        console.warn(`Repository validation failed, proceeding with clone: ${error.message}`);
      }
    }
  }

  const repoDir = await ensureCloned(githubUrl, reposDir);

  if (!fs.existsSync(repoDir)) {
    console.error(`[skip] ${name}: clone failed`);
    // Return default values if clone fails
    return {
      implementing_tools: false,
      implementing_prompts: false,
      implementing_resources: false,
      implementing_sampling: false,
      implementing_roots: false,
      implementing_logging: false,
      implementing_stdio: false,
      implementing_streamable_http: false,
      implementing_oauth2: false,
    };
  }

  const rr = await scanRepo(repoDir);

  // Convert RepoResult to the format expected by evaluate-catalog.ts
  return {
    implementing_tools: rr.tools,
    implementing_prompts: rr.prompts,
    implementing_resources: rr.resources,
    implementing_sampling: rr.sampling,
    implementing_roots: rr.roots,
    implementing_logging: rr.logging,
    implementing_stdio: rr.stdio,
    implementing_streamable_http: rr.http,
    implementing_oauth2: rr.oauth2,
  };
}