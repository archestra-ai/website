import { CommunityStats, ThreadData } from './types';

const BASE = '/community-stream/api';

export async function fetchThread(channelId: string, threadTs: string): Promise<ThreadData> {
  const res = await fetch(`${BASE}/threads?channelId=${channelId}&threadTs=${threadTs}`);
  return res.json();
}

export async function fetchStats(): Promise<CommunityStats> {
  const res = await fetch(`${BASE}/stats`);
  return res.json();
}
