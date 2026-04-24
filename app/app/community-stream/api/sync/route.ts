import { NextResponse } from 'next/server';

import { refreshCache } from '../../db/cache';
import { runSlackSync } from '../../scripts/slack-sync';

let syncing = false;
let lastSyncAt: number | null = null;

export async function POST() {
  if (syncing) {
    return NextResponse.json({ status: 'already_running' }, { status: 409 });
  }

  // Run sync in the background — don't block the response
  syncing = true;
  runSlackSync()
    .then(() => refreshCache())
    .catch((err) => console.error('Background sync failed:', err))
    .finally(() => {
      syncing = false;
      lastSyncAt = Date.now();
    });

  return NextResponse.json({ status: 'started' });
}

export async function GET() {
  return NextResponse.json({ syncing, lastSyncAt });
}
