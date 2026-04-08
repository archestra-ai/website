import { NextRequest, NextResponse } from 'next/server';

import { Octokit } from '@octokit/rest';

const GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID!;
const GITHUB_OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET!;
const GITHUB_BOT_TOKEN = process.env.GITHUB_BOT_TOKEN!;

const TARGET_OWNER = 'archestra-ai';
const TARGET_REPO = 'repo-a';
const TARGET_BRANCH = 'main';
const TARGET_FILE = 'EXTERNAL_CONTRIBUTORS.md';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://archestra.ai';

async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_OAUTH_CLIENT_ID,
      client_secret: GITHUB_OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`OAuth error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

async function getAuthenticatedUser(token: string): Promise<{ login: string; id: number }> {
  const response = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub user');
  }

  const user = await response.json();
  return { login: user.login, id: user.id };
}

async function ensureForkExists(botOctokit: Octokit): Promise<string> {
  const { data: botUser } = await botOctokit.users.getAuthenticated();
  const forkOwner = botUser.login;

  try {
    await botOctokit.repos.get({ owner: forkOwner, repo: TARGET_REPO });
  } catch {
    await botOctokit.repos.createFork({ owner: TARGET_OWNER, repo: TARGET_REPO });
    // Wait for fork to be ready
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  return forkOwner;
}

async function createContributorPR(botOctokit: Octokit, username: string, userId: number) {
  // Check current file content on upstream
  const { data: fileData } = await botOctokit.repos.getContent({
    owner: TARGET_OWNER,
    repo: TARGET_REPO,
    path: TARGET_FILE,
    ref: TARGET_BRANCH,
  });

  if (!('content' in fileData)) {
    throw new Error('Unexpected response from GitHub');
  }

  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
  const entry = `- @${username}`;

  if (currentContent.includes(entry)) {
    return { alreadyExists: true };
  }

  const forkOwner = await ensureForkExists(botOctokit);

  // Sync fork's main with upstream
  const { data: upstreamRef } = await botOctokit.git.getRef({
    owner: TARGET_OWNER,
    repo: TARGET_REPO,
    ref: `heads/${TARGET_BRANCH}`,
  });

  // Update fork's main to match upstream
  try {
    await botOctokit.git.updateRef({
      owner: forkOwner,
      repo: TARGET_REPO,
      ref: `heads/${TARGET_BRANCH}`,
      sha: upstreamRef.object.sha,
      force: true,
    });
  } catch {
    // Fork might not have main yet, create it
    await botOctokit.git.createRef({
      owner: forkOwner,
      repo: TARGET_REPO,
      ref: `refs/heads/${TARGET_BRANCH}`,
      sha: upstreamRef.object.sha,
    });
  }

  const branchName = `contributor/${username}`;

  // Delete branch on fork if it exists
  try {
    await botOctokit.git.deleteRef({
      owner: forkOwner,
      repo: TARGET_REPO,
      ref: `heads/${branchName}`,
    });
  } catch {
    // Doesn't exist, fine
  }

  // Create branch on fork
  await botOctokit.git.createRef({
    owner: forkOwner,
    repo: TARGET_REPO,
    ref: `refs/heads/${branchName}`,
    sha: upstreamRef.object.sha,
  });

  // Get file SHA from fork (should match upstream after sync)
  const { data: forkFileData } = await botOctokit.repos.getContent({
    owner: forkOwner,
    repo: TARGET_REPO,
    path: TARGET_FILE,
    ref: branchName,
  });

  if (!('sha' in forkFileData)) {
    throw new Error('Unexpected response from GitHub');
  }

  // Commit to fork branch
  const newContent = currentContent.trimEnd() + '\n' + entry + '\n';
  const authorEmail = `${userId}+${username}@users.noreply.github.com`;

  await botOctokit.repos.createOrUpdateFileContents({
    owner: forkOwner,
    repo: TARGET_REPO,
    path: TARGET_FILE,
    message: `ci(contrib): add ${username}`,
    content: Buffer.from(newContent).toString('base64'),
    sha: forkFileData.sha,
    branch: branchName,
    author: {
      name: username,
      email: authorEmail,
    },
  });

  // Create PR from fork to upstream
  const { data: pr } = await botOctokit.pulls.create({
    owner: TARGET_OWNER,
    repo: TARGET_REPO,
    title: `ci(contrib): add ${username}`,
    head: `${forkOwner}:${branchName}`,
    base: TARGET_BRANCH,
    body: `Automated: grant contributor access to @${username}`,
  });

  return { alreadyExists: false, prNumber: pr.number };
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${BASE_URL}/contributor-onboard?error=missing_code`);
  }

  try {
    const token = await exchangeCodeForToken(code);
    const user = await getAuthenticatedUser(token);

    const botOctokit = new Octokit({ auth: GITHUB_BOT_TOKEN });
    const result = await createContributorPR(botOctokit, user.login, user.id);

    if (result.alreadyExists) {
      return NextResponse.redirect(
        `${BASE_URL}/contributor-onboard?success=true&username=${user.login}`
      );
    }

    return NextResponse.redirect(
      `${BASE_URL}/contributor-onboard?success=true&username=${user.login}&pr=${result.prNumber}`
    );
  } catch (error) {
    console.error('Contributor onboard error:', error);
    return NextResponse.redirect(`${BASE_URL}/contributor-onboard?error=failed`);
  }
}
