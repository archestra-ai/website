import { UAParser } from 'ua-parser-js';

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

  const parser = new UAParser();
  const result = parser.getResult();

  const os = result.os.name?.toLowerCase() || '';
  const cpuArch = result.cpu.architecture?.toLowerCase() || '';

  // Map CPU architecture
  let architecture: Architecture = 'unknown';
  if (cpuArch.includes('arm64') || cpuArch.includes('aarch64')) {
    architecture = 'arm64';
  } else if (cpuArch.includes('amd64') || cpuArch.includes('x86_64') || cpuArch.includes('x64')) {
    architecture = 'x64';
  } else if (cpuArch === '' && os.includes('mac')) {
    // UAParser often can't detect Apple Silicon, but if we're on Mac and no arch detected,
    // we should check for Apple Silicon indicators
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('arm') || (navigator as any).userAgentData?.architecture === 'arm64') {
      architecture = 'arm64';
    } else {
      // Default to x64 for Mac if we can't detect
      architecture = 'x64';
    }
  }

  // Detect OS and return appropriate patterns
  if (os.includes('windows')) {
    return {
      platform: 'windows',
      architecture,
      displayName: 'Windows',
      filePatterns: [architecture === 'arm64' ? 'win32-arm64' : 'win32-x64', '.zip', '.exe'],
    };
  }

  if (os.includes('mac')) {
    return {
      platform: 'macos',
      architecture,
      displayName: 'macOS',
      filePatterns: [
        // For Mac, always try darwin-arm64 first since Intel Macs can run ARM builds via Rosetta
        'darwin-arm64',
        'darwin-x64',
        '.zip',
        '.dmg',
      ],
    };
  }

  if (
    os.includes('linux') ||
    os.includes('ubuntu') ||
    os.includes('debian') ||
    os.includes('fedora') ||
    os.includes('centos')
  ) {
    // Try to detect Linux distribution
    let linuxDistro: LinuxDistro = 'unknown';
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (
      os.includes('ubuntu') ||
      os.includes('debian') ||
      userAgent.includes('ubuntu') ||
      userAgent.includes('debian')
    ) {
      linuxDistro = 'deb';
    } else if (
      os.includes('fedora') ||
      os.includes('centos') ||
      os.includes('redhat') ||
      userAgent.includes('fedora') ||
      userAgent.includes('redhat') ||
      userAgent.includes('centos')
    ) {
      linuxDistro = 'rpm';
    } else {
      // Default to deb for unknown distros
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
          ? [`_${archString}.deb`, `.${archString}.deb`, '.deb']
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
