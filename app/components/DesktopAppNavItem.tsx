'use client';

import { useEffect, useState } from 'react';

import constants from '@constants';
import { type GitHubRelease, fetchLatestRelease, findMatchingAsset } from '@lib/desktop-app-github-releases';
import { type PlatformInfo, detectPlatform } from '@lib/platform-detector';

const {
  github: {
    archestra: {
      archestra: { repoUrl: desktopAppRepoUrl },
    },
  },
} = constants;

interface DesktopAppNavItemProps {
  onClose?: () => void;
}

const DesktopAppNavItem = ({ onClose }: DesktopAppNavItemProps) => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);
  const [release, setRelease] = useState<GitHubRelease | null>(null);

  useEffect(() => {
    // Detect platform
    const detected = detectPlatform();
    setPlatformInfo(detected);

    // Fetch latest release
    const loadRelease = async () => {
      try {
        const latestRelease = await fetchLatestRelease();
        if (latestRelease) {
          setRelease(latestRelease);
        }
      } catch (err) {
        console.error('Error loading release:', err);
      }
    };

    loadRelease();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!release || !platformInfo) {
      // Fallback to releases page
      window.open(`${desktopAppRepoUrl}/releases`, '_blank');
      if (onClose) onClose();
      return;
    }

    const matchingAsset = findMatchingAsset(release, platformInfo);

    if (matchingAsset && matchingAsset.browser_download_url) {
      // Start download
      window.location.href = matchingAsset.browser_download_url;
      if (onClose) onClose();
    } else {
      // No matching asset, open releases page
      window.open(`${desktopAppRepoUrl}/releases`, '_blank');
      if (onClose) onClose();
    }
  };

  return (
    <a
      href="#"
      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
      onClick={handleClick}
    >
      <div className="font-medium">Personal Desktop App</div>
      <div className="text-xs text-green-600 mt-0.5 font-semibold">New!</div>
    </a>
  );
};

export default DesktopAppNavItem;
