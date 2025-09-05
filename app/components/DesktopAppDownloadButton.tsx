'use client';

import { Download } from 'lucide-react';
import Image from 'next/image';
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

const DesktopAppDownloadButton = () => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);
  const [release, setRelease] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Detect platform
    const detected = detectPlatform();
    setPlatformInfo(detected);

    // Fetch latest release
    const loadRelease = async () => {
      try {
        setLoading(true);
        const latestRelease = await fetchLatestRelease();
        if (latestRelease) {
          setRelease(latestRelease);
        } else {
          setError('Unable to fetch latest release');
        }
      } catch (err) {
        console.error('Error loading release:', err);
        setError('Failed to load download');
      } finally {
        setLoading(false);
      }
    };

    loadRelease();
  }, []);

  const handleDownload = () => {
    if (!release || !platformInfo) {
      // Fallback to releases page
      console.log('No release or platform info available');
      window.open(`${desktopAppRepoUrl}/releases`, '_blank');
      return;
    }

    console.log('Release assets:', release.assets);
    console.log('Platform info:', platformInfo);
    
    const matchingAsset = findMatchingAsset(release, platformInfo);
    console.log('Matching asset:', matchingAsset);

    if (matchingAsset && matchingAsset.browser_download_url) {
      setDownloading(true);
      // Start download
      console.log('Downloading from:', matchingAsset.browser_download_url);
      window.location.href = matchingAsset.browser_download_url;

      // Reset downloading state after a delay
      setTimeout(() => {
        setDownloading(false);
      }, 3000);
    } else {
      // No matching asset, open releases page
      console.log('No matching asset found, opening releases page');
      window.open(`${desktopAppRepoUrl}/releases`, '_blank');
    }
  };

  const getOSIcon = () => {
    if (!platformInfo) return null;

    switch (platformInfo.platform) {
      case 'windows':
        return '/os-icons/windows.png';
      case 'macos':
        return '/os-icons/apple.png';
      case 'linux':
        return '/os-icons/linux.png';
      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (loading) return 'Loading...';
    if (downloading) return 'Downloading...';
    if (error) return 'Download Archestra';
    if (!platformInfo || platformInfo.platform === 'unknown') return 'Download Archestra';
    return `Download for ${platformInfo.displayName}`;
  };

  const osIcon = getOSIcon();

  return (
    <button
      onClick={handleDownload}
      disabled={loading || downloading}
      className="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-purple-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {/* Icon container */}
      <div className="flex items-center justify-center w-6 h-6 relative">
        {osIcon ? (
          <Image
            src={osIcon}
            alt={platformInfo?.displayName || 'OS'}
            width={24}
            height={24}
            className="object-contain"
            unoptimized
          />
        ) : (
          <Download className="w-5 h-5" />
        )}
      </div>

      {/* Text */}
      <span className="text-base font-medium">{getButtonText()}</span>

      {/* Loading shimmer effect */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer rounded-lg" />
      )}

      {/* Download progress effect */}
      {downloading && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-download-progress rounded-b-lg" />
      )}
    </button>
  );
};

export default DesktopAppDownloadButton;
