export type Platform = 'windows' | 'macos' | 'linux' | 'unknown';
export type Architecture = 'x64' | 'arm64' | 'unknown';
export type LinuxDistro = 'deb' | 'rpm' | 'unknown';

export interface PlatformInfo {
  platform: Platform;
  architecture: Architecture;
  linuxDistro?: LinuxDistro;
  displayName: string;
  filePatterns: string[];
}

export function detectPlatform(): PlatformInfo {
  if (typeof window === 'undefined') {
    return {
      platform: 'unknown',
      architecture: 'unknown',
      displayName: 'your platform',
      filePatterns: [],
    };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';

  // Detect architecture
  let architecture: Architecture = 'x64';
  if (userAgent.includes('arm') || userAgent.includes('aarch64')) {
    architecture = 'arm64';
  } else if (platform.includes('arm')) {
    architecture = 'arm64';
  }

  // Detect OS
  if (platform.startsWith('win') || userAgent.includes('windows')) {
    return {
      platform: 'windows',
      architecture,
      displayName: 'Windows',
      filePatterns: [
        architecture === 'arm64' ? 'win32-arm64' : 'win32-x64',
        'windows.exe',
        '.exe'
      ],
    };
  }

  if (platform.startsWith('mac') || userAgent.includes('mac')) {
    // Check if it's Apple Silicon
    const isAppleSilicon =
      architecture === 'arm64' ||
      ((navigator as any).userAgentData?.platform === 'macOS' &&
        (navigator as any).userAgentData?.architecture === 'arm64');

    return {
      platform: 'macos',
      architecture: isAppleSilicon ? 'arm64' : 'x64',
      displayName: 'macOS',
      filePatterns: [
        isAppleSilicon ? 'darwin-arm64' : 'darwin-x64',
        '.dmg',
      ],
    };
  }

  if (platform.includes('linux') || userAgent.includes('linux')) {
    // Try to detect Linux distribution
    let linuxDistro: LinuxDistro = 'unknown';

    // Check for Ubuntu/Debian
    if (userAgent.includes('ubuntu') || userAgent.includes('debian')) {
      linuxDistro = 'deb';
    }
    // Check for Fedora/RedHat/CentOS
    else if (userAgent.includes('fedora') || userAgent.includes('redhat') || userAgent.includes('centos')) {
      linuxDistro = 'rpm';
    }
    // Default to deb for unknown distros
    else {
      linuxDistro = 'deb';
    }

    const archString = architecture === 'arm64' ? 'arm64' : 'amd64';
    const rpmArchString = architecture === 'arm64' ? 'arm64' : 'x86_64';

    return {
      platform: 'linux',
      architecture,
      linuxDistro,
      displayName: 'Linux',
      filePatterns:
        linuxDistro === 'deb'
          ? [`.${archString}.deb`, '.deb']
          : [`.${rpmArchString}.rpm`, '.rpm'],
    };
  }

  return {
    platform: 'unknown',
    architecture: 'unknown',
    displayName: 'your platform',
    filePatterns: [],
  };
}

export function matchAssetToPattern(assetName: string, patterns: string[]): boolean {
  const lowerAssetName = assetName.toLowerCase();

  for (const pattern of patterns) {
    if (pattern.startsWith('.')) {
      // File extension match
      if (lowerAssetName.endsWith(pattern)) {
        return true;
      }
    } else {
      // Full name match
      if (lowerAssetName.includes(pattern)) {
        return true;
      }
    }
  }

  return false;
}
