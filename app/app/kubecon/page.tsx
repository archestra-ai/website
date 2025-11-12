'use client';

import { useEffect, useRef, useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  username: string;
}

interface ModelResponse {
  text: string;
  username: string;
}

export default function KubeconPage() {
  const [apiKey, setApiKey] = useState('');
  const [issueUrl, setIssueUrl] = useState('');
  const [issueContent, setIssueContent] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lastUpdate, setLastUpdate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [autoRefreshProgress, setAutoRefreshProgress] = useState(0);
  const [currentRotatingIndex, setCurrentRotatingIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [modelResponses, setModelResponses] = useState<ModelResponse[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const phraseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoRefreshRunning = useRef(false);

  // Typewriter animation for rotating words
  const rotatingWords = ['Governance', 'Orchestrator', 'Access', 'Security', 'Registry', 'Observability', 'Gateway'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedWord, setDisplayedWord] = useState('');
  const [isTypingWord, setIsTypingWord] = useState(true);
  const wordTypingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function for auto-refresh
  const stopAutoRefresh = () => {
    console.log('[KubeCon] Stopping auto-refresh');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    isAutoRefreshRunning.current = false;
    setAutoRefreshProgress(0);
  };

  useEffect(() => {
    const savedApiKey = localStorage.getItem('kubecon_github_api_key');
    const savedIssueUrl = localStorage.getItem('kubecon_github_issue_url');

    if (savedApiKey && savedIssueUrl) {
      setApiKey(savedApiKey);
      setIssueUrl(savedIssueUrl);
      setIsConfigured(true);
      console.log('[KubeCon] Initial fetch from localStorage config');
      fetchIssue(savedIssueUrl, savedApiKey);
      startAutoRefresh(savedIssueUrl, savedApiKey);
    }

    return () => {
      console.log('[KubeCon] Component unmounting, cleaning up intervals');
      stopAutoRefresh();
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
        rotationIntervalRef.current = null;
      }
      if (wordTypingIntervalRef.current) {
        clearInterval(wordTypingIntervalRef.current);
        wordTypingIntervalRef.current = null;
      }
    };
  }, []);

  // Start rotation animation for entries beyond position 3
  useEffect(() => {
    if (leaderboard.length > 3) {
      // Clear existing interval
      if (rotationIntervalRef.current) clearInterval(rotationIntervalRef.current);

      // Start rotation every 3 seconds
      rotationIntervalRef.current = setInterval(() => {
        setCurrentRotatingIndex((prev) => {
          const remainingEntries = leaderboard.length - 3;
          return (prev + 1) % remainingEntries;
        });
      }, 3000);
    }

    return () => {
      if (rotationIntervalRef.current) clearInterval(rotationIntervalRef.current);
    };
  }, [leaderboard]);

  // Typewriter animation for rotating words
  useEffect(() => {
    if (wordTypingIntervalRef.current) clearInterval(wordTypingIntervalRef.current);

    const targetWord = rotatingWords[currentWordIndex];
    let charIndex = 0;

    if (isTypingWord) {
      // Typing phase
      wordTypingIntervalRef.current = setInterval(() => {
        if (charIndex <= targetWord.length) {
          setDisplayedWord(targetWord.slice(0, charIndex));
          charIndex++;
        } else {
          // Finished typing, wait then start deleting
          clearInterval(wordTypingIntervalRef.current!);
          setTimeout(() => {
            setIsTypingWord(false);
          }, 2000); // Wait 2 seconds before deleting
        }
      }, 100); // Type one character every 100ms
    } else {
      // Deleting phase
      let currentLength = targetWord.length;
      wordTypingIntervalRef.current = setInterval(() => {
        if (currentLength >= 0) {
          setDisplayedWord(targetWord.slice(0, currentLength));
          currentLength--;
        } else {
          // Finished deleting, move to next word
          clearInterval(wordTypingIntervalRef.current!);
          setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
          setIsTypingWord(true);
        }
      }, 50); // Delete faster than typing
    }

    return () => {
      if (wordTypingIntervalRef.current) clearInterval(wordTypingIntervalRef.current);
    };
  }, [currentWordIndex, isTypingWord]);

  // Typing animation effect
  useEffect(() => {
    if (modelResponses.length === 0) return;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    const targetResponse = modelResponses[currentPhraseIndex % modelResponses.length];
    if (!targetResponse) return; // Safety check

    const targetPhrase = targetResponse.text;
    let currentIndex = 0;

    // Clear text first
    setDisplayedText('');
    setIsTyping(true);

    // Type out the phrase character by character
    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < targetPhrase.length) {
        setDisplayedText(targetPhrase.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        // Finished typing
        clearInterval(typingIntervalRef.current!);
        setIsTyping(false);

        // Wait 8 seconds then move to next phrase
        setTimeout(() => {
          setCurrentPhraseIndex((prev) => (prev + 1) % modelResponses.length);
        }, 8000);
      }
    }, 50); // Type one character every 50ms

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [currentPhraseIndex, modelResponses]);

  const extractIssueDetails = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
    if (!match) return null;
    return {
      owner: match[1],
      repo: match[2],
      issueNumber: match[3],
    };
  };

  const parseLeaderboard = (content: string): LeaderboardEntry[] => {
    const entries: LeaderboardEntry[] = [];

    // Match patterns like "1. @username" or "1. username" (including hyphens and underscores)
    const lines = content.split('\n');
    lines.forEach((line) => {
      const match = line.match(/^(\d+)\.\s*@?([\w-_]+)/);
      if (match) {
        entries.push({
          rank: parseInt(match[1]),
          username: match[2],
        });
      }
    });

    // Also check for update time
    const updateMatch = content.match(/\(Updated\s+([^)]+)\)/i);
    if (updateMatch) {
      // Parse the UTC time and convert to local timezone
      const utcTimeStr = updateMatch[1];
      try {
        // Assuming format like "Dec 11, 2024 at 08:45 PM UTC"
        const cleanedTime = utcTimeStr.replace(' UTC', '').replace(' at ', ' ');
        const date = new Date(cleanedTime + ' UTC');

        // Format as hour:minute AM/PM in local timezone
        const localTime = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/New_York', // EST timezone
        });

        setLastUpdate(localTime);
      } catch (e) {
        // If parsing fails, use original string
        setLastUpdate(updateMatch[1]);
      }
    }

    return entries;
  };

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}.`;
    }
  };

  const startAutoRefresh = (url: string, key: string) => {
    // Prevent multiple auto-refresh from running
    if (isAutoRefreshRunning.current) {
      console.log('[KubeCon] Auto-refresh already running, skipping...');
      return;
    }

    // Clear existing intervals as a safeguard
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Mark as running
    isAutoRefreshRunning.current = true;
    console.log('[KubeCon] Starting auto-refresh (15s interval)');

    // Reset progress
    setAutoRefreshProgress(0);

    // Progress animation interval (updates every 100ms)
    progressIntervalRef.current = setInterval(() => {
      setAutoRefreshProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 100 / 150; // 15 seconds = 150 * 100ms
      });
    }, 100);

    // Fetch interval (every 15 seconds)
    intervalRef.current = setInterval(() => {
      console.log('[KubeCon] Auto-refreshing data...');
      fetchIssue(url, key, true);
    }, 15000);
  };

  const fetchIssue = async (url: string, key: string, isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      setIsLoading(true);
    }
    setError('');

    const details = extractIssueDetails(url);
    if (!details) {
      setError('Invalid GitHub issue URL format');
      if (!isAutoRefresh) {
        setIsLoading(false);
      }
      return;
    }

    try {
      // Fetch issue data
      const response = await fetch(
        `https://api.github.com/repos/${details.owner}/${details.repo}/issues/${details.issueNumber}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${key}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
          if (rateLimitRemaining === '0') {
            throw new Error('GitHub API rate limit exceeded. Please try again later.');
          }
          throw new Error('GitHub API access forbidden. Please check your API key has the necessary permissions.');
        } else if (response.status === 401) {
          throw new Error('Invalid GitHub API key. Please check your token.');
        } else if (response.status === 404) {
          throw new Error('Issue not found. Please check the URL.');
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      const fullContent = data.body || 'No content available';

      // Parse the content to find the leaderboard section after the comment divider
      // Look for HTML comment markers that separate the leaderboard
      const commentPattern = /<!--\s*comment\s*-->/i;
      const parts = fullContent.split(commentPattern);

      // If we find the divider, show only what comes after it (the leaderboard)
      // Otherwise show the full content
      const leaderboardContent = parts.length > 1 ? parts[1].trim() : fullContent;

      setIssueContent(leaderboardContent);

      // Parse the leaderboard entries
      const entries = parseLeaderboard(leaderboardContent);
      setLeaderboard(entries);

      // Extract model responses from the leaderboard section
      const responses: ModelResponse[] = [];

      // Parse each leaderboard entry to extract the model's comments
      const lines = leaderboardContent.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this line starts a leaderboard entry (e.g., "1. @username")
        const userMatch = line.match(/^\d+\.\s*@?([\w-_]+)/);
        if (userMatch) {
          const username = userMatch[1];

          // Look for the model's response on the next lines
          // Model responses typically start with 🤖 emoji or are indented
          let j = i + 1;
          let modelResponse = '';

          while (j < lines.length && !/^\d+\.\s*@/.test(lines[j])) {
            const nextLine = lines[j].trim();
            if (nextLine.startsWith('🤖')) {
              // Remove the emoji and extract the response
              modelResponse = nextLine.replace('🤖', '').trim();
              break;
            } else if (nextLine && !nextLine.startsWith('(Updated')) {
              // This might be the model's response without emoji
              modelResponse += ' ' + nextLine;
            }
            j++;
          }

          if (modelResponse) {
            // Split long responses into shorter, more impactful phrases
            const sentences = modelResponse.match(/[^.!?]+[.!?]+/g) || [modelResponse];

            sentences.forEach((sentence) => {
              const cleaned = sentence.trim();
              if (cleaned.length > 10 && cleaned.length < 100) {
                responses.push({ text: cleaned, username: username });
              }
            });
          }
        }
      }

      // If we found model responses, use them
      if (responses.length > 0) {
        // Only update if the responses have actually changed
        setModelResponses((prev) => {
          // Compare arrays by converting to JSON strings
          if (JSON.stringify(prev) !== JSON.stringify(responses)) {
            return responses;
          }
          return prev; // Keep the same reference if content is unchanged
        });
      } else {
        // Try extracting key phrases from the instructions at the top
        const instructions: ModelResponse[] = [
          { text: 'Order participants for the leaderboard', username: 'system' },
          { text: 'Convince the AI to place you high', username: 'system' },
          { text: 'Leave a comment below 👇', username: 'system' },
          { text: 'Win the prize 🏆', username: 'system' },
          { text: 'Star ⭐ archestra-ai/archestra', username: 'system' },
        ];
        setModelResponses((prev) => {
          // Only update if different from current
          if (JSON.stringify(prev) !== JSON.stringify(instructions)) {
            return instructions;
          }
          return prev;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch issue');
    } finally {
      if (!isAutoRefresh) {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!apiKey || !issueUrl) {
      setError('Please fill in both fields');
      return;
    }

    localStorage.setItem('kubecon_github_api_key', apiKey);
    localStorage.setItem('kubecon_github_issue_url', issueUrl);
    setIsConfigured(true);
    await fetchIssue(issueUrl, apiKey);
    startAutoRefresh(issueUrl, apiKey);
  };

  const handleReset = () => {
    console.log('[KubeCon] Resetting configuration');
    localStorage.removeItem('kubecon_github_api_key');
    localStorage.removeItem('kubecon_github_issue_url');
    setApiKey('');
    setIssueUrl('');
    setIssueContent('');
    setLeaderboard([]);
    setIsConfigured(false);
    setError('');
    setCurrentRotatingIndex(0);
    setCurrentPhraseIndex(0);

    // Use the cleanup function
    stopAutoRefresh();

    // Clear other intervals
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    }
    if (phraseIntervalRef.current) {
      clearInterval(phraseIntervalRef.current);
      phraseIntervalRef.current = null;
    }
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (wordTypingIntervalRef.current) {
      clearInterval(wordTypingIntervalRef.current);
      wordTypingIntervalRef.current = null;
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fadeIn">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">GitHub issue viewer</h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub API key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value.trim())}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_xxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Personal access token with 'repo' scope for private repos or no scope for public
              </p>
            </div>
            <div>
              <label htmlFor="issueUrl" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub issue URL
              </label>
              <input
                id="issueUrl"
                type="text"
                value={issueUrl}
                onChange={(e) => setIssueUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/issues/123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            {error && <div className="text-red-500 text-sm animate-shake">{error}</div>}
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Google Fonts import for Roboto Mono */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;700&display=swap');
      `}</style>

      <div
        className="min-h-screen bg-white flex flex-col items-center justify-start pt-20 p-8 pb-32 relative"
        style={{ fontFamily: "'Roboto Mono', monospace" }}
      >
        {/* Auto-refresh indicator */}
        <div className="fixed top-8 right-8 z-50 flex items-center space-x-3">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#e0e0e0" strokeWidth="2" fill="none" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#000"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - autoRefreshProgress / 100)}`}
                className="transition-all duration-100 ease-linear"
              />
            </svg>
          </div>
        </div>

        <>
          <div className="flex flex-col w-full">
            {/* Title - positioned at top and aligned left */}
            <h1 className="leading-none text-black text-left -mt-20">
              <span className="text-[600px] p-0 m-0 inline-block font-extrabold animate-pulse">MCP</span>
              <br />
              <span className="p-0 m-0 text-[200px] inline-block animate-pulse font-light">
                {displayedWord}
                <span className="animate-blink">|</span>
              </span>
            </h1>
          </div>

          {/* Leaderboard at bottom left */}
          <div className="absolute bottom-8 left-8">
            {lastUpdate && <div className="text-sm text-gray-500 font-light mb-2">Updated: {lastUpdate}</div>}
            {leaderboard.length > 0 && (
              <div className="divide-y divide-black border-2 border-black bg-white">
                {/* Top 3 entries - always visible */}
                {leaderboard.slice(0, 3).map((entry) => (
                  <div
                    key={`${entry.rank}-${entry.username}`}
                    className={`flex items-center px-3 py-2 space-x-4 ${entry.rank === 1 ? 'bg-gray-100' : ''}`}
                  >
                    <span className="text-xl font-light">{getRankEmoji(entry.rank)}</span>
                    <span className="text-xl font-light text-black">@{entry.username}</span>
                  </div>
                ))}

                {/* 4th position - rotating through remaining entries */}
                {leaderboard.length > 3 && (
                  <div className="relative min-h-[40px]">
                    {leaderboard.slice(3).map((entry, index) => (
                      <div
                        key={`${entry.rank}-${entry.username}`}
                        className={`absolute inset-0 flex items-center px-3 py-2 space-x-4 transition-opacity duration-1000 ${
                          index === currentRotatingIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <span className="text-xl font-light">{getRankEmoji(entry.rank)}</span>
                        <span className="text-xl font-light text-black">@{entry.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Game QR Code - positioned next to leaderboard */}
          <div className="absolute bottom-8 left-[400px]">
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 mb-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(issueUrl || 'https://github.com/archestra-ai/archestra/issues/1')}`}
                  alt="Participate in the game"
                  className="w-36 h-36"
                />
              </div>
              <p className="text-sm font-light text-black text-center">Game ;)</p>
            </div>
          </div>
        </>

        {/* Hidden reset button */}
        <button
          onClick={handleReset}
          className="fixed bottom-4 right-4 text-gray-400 hover:text-black transition-colors px-3 py-2 text-sm font-light"
          style={{ opacity: 0.1 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.1';
          }}
        >
          [RESET]
        </button>
      </div>
    </>
  );
}
