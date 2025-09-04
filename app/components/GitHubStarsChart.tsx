'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface StarDataPoint {
  date: string;
  stars: number;
}

export default function GitHubStarsChart() {
  const [data, setData] = useState<StarDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStarHistory() {
      try {
        const response = await fetch('/api/github-stars');
        if (!response.ok) {
          throw new Error('Failed to fetch star history');
        }
        const result = await response.json();
        setData(result.history || []);
      } catch (err) {
        console.error('Error fetching star history:', err);
        setError('Failed to load star history');
      } finally {
        setLoading(false);
      }
    }

    fetchStarHistory();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading star history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-gray-500">No star history available</div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format the data for the chart with timestamps for proper time scaling
  const chartData = data.map((point) => ({
    ...point,
    timestamp: new Date(point.date).getTime(),
    displayDate: formatDate(point.date),
  }));

  // Format timestamp for X-axis display
  const formatXAxisTick = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format timestamp for tooltip
  const formatTooltipLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="w-full">
      <h4 className="text-xs font-medium text-gray-600 mb-2">Star History</h4>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorStars" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={formatXAxisTick}
            ticks={chartData.map((d) => d.timestamp)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            width={35}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            labelFormatter={formatTooltipLabel}
            formatter={(value: number) => [`${value} stars`, 'Stars']}
          />
          <Area
            type="monotone"
            dataKey="stars"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorStars)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
