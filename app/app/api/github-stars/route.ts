import { NextResponse } from 'next/server';
import { createClient } from 'redis';

import constants from '@constants';

const {
  github: {
    archestra: {
      orgName: githubOrgName,
      archestra: { repoName: githubArchestraRepoName },
    },
  },
} = constants;

const REDIS_KEY = 'github-stars-history';

interface StarDataPoint {
  date: string;
  stars: number;
}

// Create Redis client - will automatically use REDIS_URL on Vercel
const redis = createClient();
redis.on('error', (err) => console.error('Redis Client Error', err));

async function fetchCurrentStars(): Promise<number> {
  const githubApiUrl = `https://api.github.com/repos/${githubOrgName}/${githubArchestraRepoName}`;

  try {
    const response = await fetch(githubApiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const data = await response.json();
    return data.stargazers_count || 0;
  } catch (error) {
    console.error('Error fetching GitHub stars:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`GitHub Stars API called for date: ${today}`);

    // Initialize history array
    let history: StarDataPoint[] = [];

    try {
      // Connect to Redis
      await redis.connect();
      console.log('Redis connected, checking for stored data...');

      // Get history from Redis
      const storedData = await redis.get(REDIS_KEY);
      if (storedData) {
        history = JSON.parse(storedData) as StarDataPoint[];
        console.log(`Found ${history.length} historical data points in Redis`);
      } else {
        console.log('No historical data found in Redis');
      }

      // Check if we already have today's data
      const todayIndex = history.findIndex((point) => point.date === today);
      console.log(`Today's data exists: ${todayIndex >= 0}`);

      if (todayIndex >= 0) {
        // We already have today's data, no need to fetch from GitHub
        console.log(`Using cached star data for today: ${history[todayIndex].stars} stars`);
      } else {
        // We don't have today's data, fetch from GitHub
        console.log('Fetching fresh star data from GitHub');
        const currentStars = await fetchCurrentStars();

        // Add new entry for today
        history.push({ date: today, stars: currentStars });

        // Sort by date
        history.sort((a, b) => a.date.localeCompare(b.date));

        // Save updated history to Redis
        await redis.set(REDIS_KEY, JSON.stringify(history));
        console.log('Updated history saved to Redis');
      }

      // Disconnect from Redis
      await redis.disconnect();
    } catch (redisError) {
      console.error('Redis error (falling back to direct fetch):', redisError);
      // If Redis fails, just fetch current data
      const currentStars = await fetchCurrentStars();
      history = [
        {
          date: today,
          stars: currentStars,
        },
      ];
    }

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error in GitHub stars API:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub stars' }, { status: 500 });
  }
}
