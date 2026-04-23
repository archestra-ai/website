import { NextResponse } from 'next/server';

import { refreshCache } from '../../db/cache';

export async function POST() {
  await refreshCache();
  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString() });
}
