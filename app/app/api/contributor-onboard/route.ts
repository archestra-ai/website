import crypto from 'crypto';
import { NextResponse } from 'next/server';

const GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/contributor-onboard/callback`
  : 'https://archestra.ai/api/contributor-onboard/callback';

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: GITHUB_OAUTH_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: '',
    state,
  });

  const response = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);

  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/api/contributor-onboard/callback',
  });

  return response;
}
