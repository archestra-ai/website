import { Github, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

import constants from '@constants';

const {
  github: {
    archestra: {
      orgName: githubOrgName,
      archestra: { repoName: desktopAppRepoName, repoUrl: desktopAppRepoUrl },
    },
  },
} = constants;

export function GitHubStarButton() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStars() {
      try {
        const response = await fetch(`https://api.github.com/repos/${githubOrgName}/${desktopAppRepoName}`);
        if (response.ok) {
          const data = await response.json();
          setStars(data.stargazers_count);
        }
      } catch (error) {
        console.error('Error fetching GitHub stars:', error);
      }
    }

    fetchStars();
  }, []);

  return (
    <a
      href={desktopAppRepoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
    >
      <Github className="h-4 w-4" />
      <span>Star us on GitHub ⭐</span>
      {stars !== null && (
        <>
          <div className="w-px h-4 bg-gray-300" />
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            {stars}
          </span>
        </>
      )}
    </a>
  );
}
