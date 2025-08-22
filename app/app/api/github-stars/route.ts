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
let redis: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  // Check if REDIS_URL is configured
  if (!process.env.REDIS_URL && !process.env.KV_URL) {
    throw new Error('No Redis/KV URL configured');
  }
  
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL || process.env.KV_URL
    });
    redis.on('error', (err) => console.error('Redis Client Error', err));
  }
  
  // Check if already connected
  if (!redis.isOpen) {
    await redis.connect();
  }
  
  return redis;
}

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
      // Get Redis client
      const redisClient = await getRedisClient();
      console.log('Redis connected, checking for stored data...');

      // Get history from Redis
      const storedData = await redisClient.get(REDIS_KEY);
      if (storedData) {
        history = JSON.parse(storedData) as StarDataPoint[];
        console.log(`Found ${history.length} historical data points in Redis`);
      } else {
        console.log('No historical data found in Redis');
      }

      // If we have less than 2 data points, add the seed data
      if (history.length < 2) {
        console.log('Less than 2 data points found, adding seed data');
        const seedDate = '2024-08-05';
        // Only add if it doesn't already exist
        if (!history.find(point => point.date === seedDate)) {
          history.push({
            date: seedDate,
            stars: 3
          });
          // Sort by date
          history.sort((a, b) => a.date.localeCompare(b.date));
          // Save the seed data to Redis
          await redisClient.set(REDIS_KEY, JSON.stringify(history));
          console.log('Seed data added to Redis');
        }
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
        await redisClient.set(REDIS_KEY, JSON.stringify(history));
        console.log('Updated history saved to Redis');
      }

      // Don't disconnect in serverless environment - connection will be reused
      // await redisClient.disconnect();
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
