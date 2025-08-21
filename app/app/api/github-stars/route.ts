import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

import constants from '@constants';

const {
  github: {
    archestra: {
      orgName: githubOrgName,
      archestra: { repoName: githubArchestraRepoName },
    },
  },
} = constants;

const KV_KEY = 'github-stars-history';

interface StarDataPoint {
  date: string;
  stars: number;
}

async function fetchCurrentStars(): Promise<number> {
  const githubApiUrl = `https://api.github.com/repos/${githubOrgName}/${githubArchestraRepoName}`;
  
  try {
    const response = await fetch(githubApiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
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
    // Get current stars
    const currentStars = await fetchCurrentStars();
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize history array
    let history: StarDataPoint[] = [];
    
    // Check if KV is configured
    if (!process.env.KV_URL) {
      // If KV is not configured, just return today's data point
      history = [{
        date: today,
        stars: currentStars
      }];
      return NextResponse.json({ history });
    }

    // Get history from KV
    try {
      const storedHistory = await kv.get<StarDataPoint[]>(KV_KEY);
      if (storedHistory) {
        history = storedHistory;
      }
    } catch (kvError) {
      console.error('Error reading from KV:', kvError);
    }

    // Check if we already have today's data
    const todayIndex = history.findIndex(point => point.date === today);
    
    if (todayIndex >= 0) {
      // Update today's entry
      history[todayIndex].stars = currentStars;
    } else {
      // Add new entry for today
      history.push({ date: today, stars: currentStars });
    }

    // Sort by date
    history.sort((a, b) => a.date.localeCompare(b.date));

    // Save updated history to KV (no limit on history)
    try {
      await kv.set(KV_KEY, history);
    } catch (kvError) {
      console.error('Error writing to KV:', kvError);
    }

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error in GitHub stars API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub stars' },
      { status: 500 }
    );
  }
}