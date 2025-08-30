#!/usr/bin/env tsx
// @ts-nocheck
/* eslint-disable no-console */

/**
 * MCP Protocol Features Detection Script
 * 
 * This script provides pattern-based analysis of MCP server repositories to detect
 * which protocol features are implemented. It can be used both standalone and
 * integrated with evaluate-catalog.ts.
 * 
 * Integration:
 * - Standalone: Run directly with npm run mcp-features2
 * - Integrated: Called from evaluate-catalog.ts via extractProtocolFeaturesFromUrl()
 * 
 * The pattern-based approach is more reliable than AI-based analysis for detecting
 * MCP protocol features in code.
 */

// дальше — твои импорты:

const { execFile } = require("child_process");
const fs = require("fs");
const fsp = fs.promises;
const os = require("os");
const path = require("path");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

// ---------------------- URLS ----------------------
const URLS: string[] = [
  // "https://github.com/hannesrudolph/imessage-query-fastmcp-mcp-server",
  // "https://github.com/i-am-bee/acp-mcp",
  // ... (keep your commented list if you want)
  "https://github.com/UserAd/didlogic_mcp", // prompts, sampling
  "https://github.com/1mcp-app/agent",
  "https://github.com/grafana/mcp-grafana",
];

// ---------------------- Heuristic patterns ------------------
// Keep patterns conservative; all matches are case-insensitive.

const PAT_MCP_SDK = [
  // JS/TS + Python SDKs
  String.raw`@modelcontextprotocol\/`,
  String.raw`\bfrom\s+mcp\.server\b`,
  String.raw`\bimport\s+mcp\.server\b`,
  String.raw`\bfrom\s+mcp\b`,
  String.raw`\bimport\s+mcp\b`,
  String.raw`\bfastmcp\b`,
  String.raw`\bcrate\s*=\s*"mcp"`,

  // MCP method/route names (language-agnostic, code-only)
  String.raw`\binitialize\b`,
  String.raw`\btools\/list\b`,
  String.raw`\bprompts\/list\b`,
  String.raw`\bresources\/list\b`,
  String.raw`\bresources\/templates\/list\b`,
  String.raw`\bnotifications\/logMessage\b`,
  String.raw`\bcompletions?\b`, // weak hint

  // Go/Cobra CLI wiring for an "mcp" subcommand
  String.raw`\bUse:\s*"mcp"\b`,
  String.raw`\bcobra\.Command\b`,
  String.raw`\bAddCommand\([^)]*mcp[^)]*\)`,
  String.raw`--stdio\b`,
  String.raw`--host\b`,
  String.raw`--port\b`,
];

const PAT_TOOLS = [
  // Canonical
  String.raw`\btools\/list\b`,
  String.raw`\btools\/call\b`,

  // Python
  String.raw`@mcp\.tool\b`,
  String.raw`\bmcp\.tool\(`,

  // TS/JS helpers
  String.raw`\b(add|register|define)[_\-]?tool(s)?\s*\(`,
  String.raw`\bdefineTool(s)?\b`,
  String.raw`\bregisterTool(s)?\b`,
  String.raw`\baddTool(s)?\b`,

  // Go-ish
  String.raw`\bTools(List|Call)\b`,
  String.raw`\b(Call|List)Tool(s)?\b`,

  // Weak catch-all
  String.raw`\btools\s*[:=]\s*\[`,
];

const PAT_PROMPTS = [
  // Canonical
  String.raw`\bprompts\/list\b`,
  String.raw`\bprompts\/get\b`,

  // Python
  String.raw`@mcp\.prompt\b`,
  String.raw`\bmcp\.prompt\(`,

  // TS/JS
  String.raw`\b(add|register|define)[_\-]?prompt(s)?\s*\(`,
  String.raw`\bprompts\s*[:=]\s*\[`,

  // Go-ish
  String.raw`\bPrompts(List|Get)\b`,
];

const PAT_RESOURCES = [
  // Canonical
  String.raw`\bresources\/list\b`,
  String.raw`\bresources\/read\b`,
  String.raw`\bresources\/templates\/list\b`,
  String.raw`\bresources\/subscribe\b`,
  String.raw`\bnotifications\/resources\/(updated|list_changed)\b`,

  // Python
  String.raw`@mcp\.resource\b`,
  String.raw`\bmcp\.resource\(`,

  // TS/JS helpers
  String.raw`\b(add|register|define)[_\-]?resource(s)?\s*\(`,
  String.raw`\bdefineResource(s)?\b`,
  String.raw`\bregisterResource(s)?\b`,
  String.raw`\baddResource(s)?\b`,

  // Go-ish
  String.raw`\bResources(List|Read|Subscribe)\b`,

  // Weak
  String.raw`\bresourceTemplates?\s*[:=]\s*\[`,
];

// -------- MCP client sampling & completion utility (per spec) --------
const PAT_SAMPLING_MCP = [
  // Capability announcement during initialization
  String.raw`"capabilities"\s*:\s*{[^}]*"sampling"\s*:\s*{`,
  String.raw`\bsampling\s*"\s*:\s*{`,

  // JSON-RPC method
  String.raw`\bsampling\/createMessage\b`,
  String.raw`"method"\s*:\s*"sampling\/createMessage"`,

  // Common request/response fields
  String.raw`"modelPreferences"\s*:`,
  String.raw`"hints"\s*:\s*\[`,
  String.raw`"(cost|speed|intelligence)Priority"\s*:\s*`,
  String.raw`"systemPrompt"\s*:`,
  String.raw`"maxTokens"\s*:`,
  String.raw`"stopReason"\s*:`,
  // message content types
  String.raw`"content"\s*:\s*{\s*"type"\s*:\s*"(text|image|audio)"`,
];

const PAT_COMPLETION_UTILITY = [
  // Capability
  String.raw`"capabilities"\s*:\s*{[^}]*"completions"\s*:\s*{`,

  // JSON-RPC method
  String.raw`\bcompletion\/complete\b`,
  String.raw`"method"\s*:\s*"completion\/complete"`,

  // Reference types and payload shape
  String.raw`"ref"\s*:\s*{\s*"type"\s*:\s*"ref\/(prompt|resource)"`,
  String.raw`"argument"\s*:\s*{\s*"name"\s*:\s*`,
  String.raw`"completion"\s*:\s*{\s*"values"\s*:\s*\[`,
  String.raw`"hasMore"\s*:\s*(true|false)`,
  String.raw`"total"\s*:\s*\d+`,
];

const PAT_LOGGING_ROUTES = [
  String.raw`["'\`]logging\/setLevel["'\`]`,
  String.raw`["'\`]notifications\/message["'\`]`,
];

const PAT_LOGGING_GO = [
  String.raw`\bLoggingMessage(Notification|Params|Level)\b`,
  String.raw`\bNewLoggingMessage(Notification|Params)\b`,
  String.raw`\bSetLoggingLevel(Request|Params)?\b`,
];

const PAT_LOGGING_TS = [
  String.raw`\bonLogMessage\b`,
  String.raw`\bsetLoggingLevel\b`,
  String.raw`\blogging\s*:\s*{`,
];

const PAT_LOGGING_PY = [
  String.raw`\bon_log_message\b`,
  String.raw`\bset_logging_level\b`,
  String.raw`\blogging\s*=\s*`,
];

const PAT_LOGGING_CAP = [
  String.raw`\bserverCapabilities\.logging\b`,
  String.raw`\bcapabilities\.logging\b`,
];

const PAT_STDIO = [
  String.raw`\bstdio\b`,
  String.raw`\bprocess\.stdin\b|\bprocess\.stdout\b`,
  String.raw`\bsys\.stdin\b|\bsys\.stdout\b`,
  String.raw`\bos\.Stdin\b`,
  String.raw`\bos\.Stdout\b`,
  String.raw`bufio\.NewReader\(\s*os\.Stdin\s*\)`,
  String.raw`bufio\.NewWriter\(\s*os\.Stdout\s*\)`,
  String.raw`json\.NewDecoder\(\s*os\.Stdin\s*\)`,
  String.raw`json\.NewEncoder\(\s*os\.Stdout\s*\)`,
];

const PAT_HTTP = [
  // Python web
  String.raw`\bfastapi\b|\bflask\b|\baiohttp\b|\buvicorn\b`,
  // Node
  String.raw`\bexpress\(\)|\bfastify\b|\bkoa\b|\bhono\b`,
  String.raw`\bhttp\.createServer\b`,
  // Rust
  String.raw`\baxum\b|\bactix\b|\bwarp\b`,
  // Go
  String.raw`\b"net/http"\b`,
  String.raw`\bnet/http\b`,
  String.raw`http\.ListenAndServe\b`,
  String.raw`http\.Handle(Func)?\b`,
  // SSE hints
  String.raw`\btext\/event\-stream\b|\bStreamable\b`,
  String.raw`\bServer\-Sent\s*Events\b|\bSSE\b`,
];

const PAT_OAUTH2 = [
  String.raw`\boauth2\b|\bOAuth2\b`,
  String.raw`\bWWW-Authenticate\b`,
  String.raw`\bresource_metadata\b`,
  String.raw`\bAuthorizationCodeBearer\b|\bOpenID\b`,
];

const PAT_ROOTS_CAP = [
  String.raw`"capabilities"\s*:\s*{[^}]*"roots"\s*:\s*{`,
  String.raw`"listChanged"\s*:\s*(true|false)`,
];

const PAT_ROOTS_METHODS = [
  String.raw`\broots\/list\b`,
  String.raw`\bnotifications\/roots\/list_changed\b`,
];

const PAT_ROOTS_PAYLOAD = [
  String.raw`"roots"\s*:\s*\[`,
  String.raw`"uri"\s*:\s*"`,
  String.raw`"name"\s*:\s*"`,
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

async function robustRmTree(target: string): Promise<void> {
  // Node 18+: fs.rm supports force+recursive. We add retries/chmod for Windows read-only files.
  const attempt = async () => {
    try {
      await fsp.rm(target, { recursive: true, force: true });
    } catch {
      // best-effort: walk and chmod+w then try again
      try {
        await chmodTree(target);
        await fsp.rm(target, { recursive: true, force: true });
      } catch {
        // swallow: temp dir cleanup is best-effort
      }
    }
  };
  await attempt();
}

async function chmodTree(root: string): Promise<void> {
  try {
    const st = await fsp.stat(root);
    if (st.isDirectory()) {
      const entries = await fsp.readdir(root);
      await Promise.all(entries.map((e) => chmodTree(path.join(root, e))));
    }
    await fsp.chmod(root, 0o666);
  } catch {
    // ignore
  }
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
    let dirents: fs.Dirent[];
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

function renderBlock(rr: RepoResult): string {
  return (
    `${rr.name}
MCP Protocol Support
Implemented MCP protocol features
🤖 Evaluated by gemini-2.5-pro
Fix
Tools: ${rr.tools ? "✓" : "✗"}
Prompts: ${rr.prompts ? "✓" : "✗"}
Resources: ${rr.resources ? "✓" : "✗"}
Sampling: ${rr.sampling ? "✓" : "✗"}
Roots: ${rr.roots ? "✓" : "✗"}
Logging: ${rr.logging ? "✓" : "✗"}
STDIO Transport: ${rr.stdio ? "✓" : "✗"}
HTTP Transport: ${rr.http ? "✓" : "✗"}
OAuth2 Auth: ${rr.oauth2 ? "✓" : "✗"}
`
  );
}

// ============= New Function for evaluate-catalog.ts =============

/**
 * Extract protocol features from a GitHub repository URL using pattern-based analysis
 * This function is designed to be called from evaluate-catalog.ts
 */
export async function extractProtocolFeaturesFromUrl(
  githubUrl: string,
  repositoryPath: string | null = null
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
  const keep = false; // Always clean up temp files when called from evaluate-catalog

  // Create temp workspace
  const tmpRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "mcp_repos_"));
  const reposDir = path.join(tmpRoot, "repos");
  await fsp.mkdir(reposDir, { recursive: true });

  try {
    const name = repoNameFromUrl(githubUrl);
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
  } finally {
    if (keep) {
      console.error(`[keep] workspace kept at: ${tmpRoot}`);
    } else {
      await robustRmTree(tmpRoot);
    }
  }
}

// Keep the original main function for standalone usage
async function main() {
  const keep = process.argv.includes("--keep");

  // Create temp workspace
  const tmpRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "mcp_repos_"));
  const reposDir = path.join(tmpRoot, "repos");
  await fsp.mkdir(reposDir, { recursive: true });

  try {
    for (const url of URLS) {
      const name = repoNameFromUrl(url);
      const repoDir = await ensureCloned(url, reposDir);
      if (!fs.existsSync(repoDir)) {
        console.error(`[skip] ${name}: clone failed`);
        continue;
      }
      const rr = await scanRepo(repoDir);
      process.stdout.write(renderBlock(rr));
    }
  } finally {
    if (keep) {
      console.error(`[keep] workspace kept at: ${tmpRoot}`);
    } else {
      await robustRmTree(tmpRoot);
    }
  }
}

// Only run main if this file is executed directly
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
