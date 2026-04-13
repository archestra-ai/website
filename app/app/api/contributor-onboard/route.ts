import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/contributor-onboard/callback`
  : 'https://archestra.ai/api/contributor-onboard/callback';
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY!;

function errorRedirect(req: NextRequest, error: string) {
  const url = new URL('/contributor-onboard', req.url);
  url.searchParams.set('error', error);
  return NextResponse.redirect(url, 303);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const token = formData.get('cf-turnstile-response');

  if (typeof token !== 'string' || !token) {
    return errorRedirect(req, 'captcha_missing');
  }

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: token }),
  });
  const verifyJson = (await verifyRes.json()) as { success: boolean };
  if (!verifyJson.success) {
    return errorRedirect(req, 'captcha_failed');
  }

  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: GITHUB_OAUTH_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: '',
    state,
  });

  const response = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`, 303);
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/api/contributor-onboard/callback',
  });
  return response;
}
