import { NextRequest, NextResponse } from 'next/server';

import {
  cachedGetLatestMessages,
  cachedGetMessagesAfter,
  cachedGetMessagesAround,
  cachedGetMessagesBefore,
  cachedGetUsers,
  cachedHasNewerMessages,
  cachedHasOlderMessages,
} from '../../db/cache';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const channelId = searchParams.get('channelId');
  const around = searchParams.get('around');
  const before = searchParams.get('before');
  const after = searchParams.get('after');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  if (!channelId) {
    return NextResponse.json({ error: 'channelId required' }, { status: 400 });
  }

  let messages;
  if (around) {
    messages = await cachedGetMessagesAround(channelId, around, limit);
  } else if (before) {
    messages = await cachedGetMessagesBefore(channelId, before, limit);
  } else if (after) {
    messages = await cachedGetMessagesAfter(channelId, after, limit);
  } else {
    messages = await cachedGetLatestMessages(channelId, limit);
  }

  const users = await cachedGetUsers();

  let hasOlder = false;
  let hasNewer = false;
  if (messages.length > 0) {
    hasOlder = await cachedHasOlderMessages(channelId, messages[0].ts);
    hasNewer = await cachedHasNewerMessages(channelId, messages[messages.length - 1].ts);
  }

  return NextResponse.json({ messages, users, hasOlder, hasNewer });
}
