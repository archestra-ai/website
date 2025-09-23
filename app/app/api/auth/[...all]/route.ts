import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@lib/db/auth';

const handler = toNextJsHandler(auth);

// Wrap the GET handler to intercept successful authentication
export async function GET(req: NextRequest) {
  const response = await handler.GET(req);
  
  // Check if this is a successful OAuth callback
  const url = new URL(req.url);
  const isCallback = url.pathname.includes('/callback/');
  const callbackUrl = url.searchParams.get('callbackURL');
  
  // If this is a successful OAuth callback and we have a desktop callback URL
  if (isCallback && callbackUrl?.includes('archestra-ai://')) {
    try {
      // Get the session from better-auth
      const sessionCookie = response.headers.get('set-cookie');
      if (sessionCookie) {
        // Extract the session token from the cookie
        const sessionMatch = sessionCookie.match(/better-auth.session_token=([^;]+)/);
        if (sessionMatch) {
          const sessionToken = sessionMatch[1];
          
          // Redirect to the desktop app with the session token
          const deepLinkUrl = `archestra-ai://auth-success?token=${encodeURIComponent(sessionToken)}`;
          return NextResponse.redirect(deepLinkUrl);
        }
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
    }
  }
  
  return response;
}

export const POST = handler.POST;
