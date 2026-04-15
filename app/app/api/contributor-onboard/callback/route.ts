import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID!;
const GITHUB_OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET!;
const GITHUB_APP_ID = process.env.GITHUB_APP_ID!;
const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY!;
const GITHUB_APP_INSTALLATION_ID = process.env.GITHUB_APP_INSTALLATION_ID!;

const TARGET_OWNER = 'archestra-ai';
const TARGET_REPO = 'archestra';
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

async function createContributorPR(botOctokit: Octokit, username: string, userId: number) {
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

  const branchName = `contributor/${username}-${Date.now()}`;
  const newContent = currentContent.trimEnd() + '\n' + entry + '\n';
  const authorEmail = `${userId}+${username}@users.noreply.github.com`;

  await botOctokit.repos.createOrUpdateFileContents({
    owner: TARGET_OWNER,
    repo: TARGET_REPO,
    path: TARGET_FILE,
    message: `ci(contrib): add ${username}`,
    content: Buffer.from(newContent).toString('base64'),
    sha: fileData.sha,
    branch: branchName,
    author: {
      name: username,
      email: authorEmail,
    },
  });

  const { data: pr } = await botOctokit.pulls.create({
    owner: TARGET_OWNER,
    repo: TARGET_REPO,
    title: `ci(contrib): add ${username}`,
    head: branchName,
    base: TARGET_BRANCH,
    body: `Automated: grant contributor access to @${username}`,
  });

  return { alreadyExists: false, prNumber: pr.number };
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${BASE_URL}/contributor-onboard?error=missing_code`);
  }

  try {
    const token = await exchangeCodeForToken(code);
    const user = await getAuthenticatedUser(token);

    const botOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: GITHUB_APP_ID,
        privateKey: GITHUB_APP_PRIVATE_KEY,
        installationId: GITHUB_APP_INSTALLATION_ID,
      },
    });
    const result = await createContributorPR(botOctokit, user.login, user.id);

    const redirectUrl = result.alreadyExists
      ? `${BASE_URL}/contributor-onboard?success=true&username=${user.login}`
      : `${BASE_URL}/contributor-onboard?success=true&username=${user.login}&pr=${result.prNumber}`;

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete('oauth_state');
    return response;
  } catch (error) {
    console.error('Contributor onboard error:', error);
    const response = NextResponse.redirect(`${BASE_URL}/contributor-onboard?error=failed`);
    response.cookies.delete('oauth_state');
    return response;
  }
}
