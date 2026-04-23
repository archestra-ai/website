import { NextResponse } from 'next/server';

import { cachedGetChannelStats, cachedGetTotalMemberCount, cachedGetTotalTodayMessages } from '../../db/cache';

export async function GET() {
  const [channelStats, totalTodayMessages, memberCount] = await Promise.all([
    cachedGetChannelStats(),
    cachedGetTotalTodayMessages(),
    cachedGetTotalMemberCount(),
  ]);

  return NextResponse.json({
    totalTodayMessages,
    memberCount,
    newMembersToday: 0,
    channels: channelStats,
  });
}
