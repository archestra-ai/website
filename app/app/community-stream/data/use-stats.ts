'use client';

import { useEffect, useState } from 'react';

import { fetchStats } from './api';
import { CommunityStats } from './types';

const DEFAULT_STATS: CommunityStats = {
  totalTodayMessages: 0,
  memberCount: 0,
  newMembersToday: 0,
  channels: {},
};

export function useCommunityStats(): CommunityStats {
  const [stats, setStats] = useState<CommunityStats>(DEFAULT_STATS);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {});
  }, []);

  return stats;
}
