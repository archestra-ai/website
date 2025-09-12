# Create GitHub Issues for Broken MCP Servers

This script automatically creates GitHub issues for MCP servers that are failing installation tests. It identifies the most popular broken servers.

## Prerequisites

1. **GitHub Personal Access Token (PAT)**
   - Your GitHub PAT must have the `public_repo` scope enabled
   - Create a PAT at: https://github.com/settings/tokens
   - Required scopes: `public_repo` (for creating issues and comments)

2. **Slack Invite Link**
   - A Slack workspace invite link for the Archestra community
   - This will be included in a comment on each issue to help contributors

3. **Node.js Dependencies**
   - Install dependencies from the project root:

   ```bash
   cd /path/to/website/app
   pnpm install
   ```

4. **CSV Audit File**
   - Place the audit CSV file at: `app/scripts/create-github-issues-for-mcp-servers/mcp_catalog_audit.csv`
   - Generate this file by running:
   ```bash
   npx tsx app/mcp-catalog/scripts/audit-server-configs.ts
   ```

## CSV Data Format

The audit CSV should contain server test results with the following structure:

```csv
Server Name,File Name,Config Type,Docker Permutation Key,Install Success,Logs Retrieved,Ping Success,Error,Timestamp
0xdaef0f__job-searchoor,0xdaef0f__job-searchoor.json,server,,TRUE,TRUE,TRUE,,2025-09-08T15:41:05.845Z
0xshellming__mcp-summarizer,0xshellming__mcp-summarizer.json,server,,FALSE,FALSE,FALSE,Request failed,2025-09-08T15:41:05.846Z
13bm__ghidramcp,13bm__ghidramcp.json,server,,FALSE,FALSE,FALSE,Request failed,2025-09-08T15:41:05.847Z
1mcp-app__agent,1mcp-app__agent.json,server,,FALSE,FALSE,FALSE,Request failed,2025-09-08T15:41:05.847Z
21st-dev__magic-mcp,21st-dev__magic-mcp.json,server,,TRUE,TRUE,FALSE,Error indicators found in logs,2025-09-08T15:41:05.847Z
```

Servers with `Install Success = FALSE` are considered broken and eligible for issue creation.

## How It Works

1. **Reads the CSV file** to identify all broken servers (Install Success = FALSE)
2. **Fetches top 15 servers by quality score** from the MCP catalog API
3. **Fetches top 15 servers by GitHub stars** from the MCP catalog API
4. **Cross-references** both lists with broken servers from the CSV
5. **Creates a union** of broken servers found in either top list (max 30 servers)
6. **For each broken server:**
   - Checks if an issue already exists (idempotent)
   - Creates a GitHub issue if needed
   - Adds a `/bounty 15` comment
   - Adds a Slack invite comment for community support

## Usage

### Run the Script

```bash
# From the app directory
GITHUB_PAT=your_github_pat_here SLACK_INVITE_LINK=https://your-slack-invite.link npx tsx scripts/create-github-issues-for-mcp-servers/index.ts

# Or with dry-run mode (no issues created, just preview)
npx tsx scripts/create-github-issues-for-mcp-servers/index.ts --dry-run
```

### Example Output

```
Running in DRY RUN mode - no issues will be created
Reading CSV file...
Found 797 broken servers in CSV
Fetching top 15 servers by quality...
Found 9 broken servers in top 15 by quality
Fetching top 15 servers by stars...
Found 13 broken servers in top 15 by stars

Total unique broken servers to process: 21

Creating GitHub issues...
Processing modelcontextprotocol__servers__src__filesystem...
Issue already exists for modelcontextprotocol__servers__src__filesystem (issue #123), skipping creation
...
```

## Issue Format

Each created issue will have:

**Title:** `[MCP Catalog] Issue with <server_name>`

**Body:**

```markdown
**Describe the issue**

The current `server` configuration for this MCP server does not work. Trying to install this MCP server in the desktop application is not successful. The server's data can be found at https://github.com/archestra-ai/website/tree/main/app/app/mcp-catalog/data/mcp-evaluations/<server_name>.json

**Definition of done**

You should open a pull request in `archestra-ai/website` which modifies the `server` and/or `user_config` objects such that you can install the MCP server in the Archestra desktop application.

In the pull request, you should upload a very short video showing that you are able to install the server + make at least one tool call in the chat using one or more tools from the server 😀
```

**Comments:**

1. **Bounty Comment:** `/bounty 15`
2. **Slack Invite Comment:** `If you have any questions about this [come join us](SLACK_INVITE_LINK) in the Archestra community Slack workspace! 🙂`

## Features

- **Idempotent**: Won't create duplicate issues if they already exist
- **Rate limiting protection**: Includes delays between API calls
- **Error handling**: Graceful error messages with helpful debugging info
- **Dry-run mode**: Test without creating actual issues

## Troubleshooting

### 404 Error When Creating Issues

- Ensure your GitHub PAT has the `public_repo` scope
- Verify you have write access to the `archestra-ai/archestra` repository
- Check that issues are enabled on the repository

### CSV File Not Found

- Make sure `mcp_catalog_audit.csv` exists in the script directory
- Run the audit script to generate it: `npx tsx app/mcp-catalog/scripts/audit-server-configs.ts`

### No Broken Servers Found

- This means none of the top 15 servers (by quality or stars) are broken
- Check the CSV file to ensure it contains test results

### Missing SLACK_INVITE_LINK

- The SLACK_INVITE_LINK environment variable is required
- Provide a valid Slack invite link for your community workspace
