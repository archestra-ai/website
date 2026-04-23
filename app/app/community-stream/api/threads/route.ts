import { NextRequest, NextResponse } from 'next/server';

import { cachedGetMessage, cachedGetThreadReplies, cachedGetUsers } from '../../db/cache';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const channelId = searchParams.get('channelId');
  const threadTs = searchParams.get('threadTs');

  if (!channelId || !threadTs) {
    return NextResponse.json({ error: 'channelId and threadTs required' }, { status: 400 });
  }

  const parentMessage = await cachedGetMessage(channelId, threadTs);
  if (!parentMessage) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  const replies = await cachedGetThreadReplies(channelId, threadTs);
  const users = await cachedGetUsers();

  return NextResponse.json({ parentMessage, replies, users });
}
