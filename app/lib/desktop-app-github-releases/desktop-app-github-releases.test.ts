import type { PlatformInfo } from '@lib/platform-detector';

import { type GitHubAsset, type GitHubRelease, fetchLatestRelease, findMatchingAsset, formatFileSize } from './';

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};

describe('desktop-app-github-releases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('window', {
      localStorage: localStorageMock,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetchLatestRelease', () => {
    const mockRelease: GitHubRelease = {
      id: 123456,
      tag_name: 'v1.0.0',
      name: 'Release 1.0.0',
      published_at: '2024-01-01T00:00:00Z',
      assets: [
        {
          name: 'archestra-windows-x64.exe',
          browser_download_url:
            'https://github.com/archestra-ai/archestra/releases/download/v1.0.0/archestra-windows-x64.exe',
          size: 50000000,
        },
        {
          name: 'archestra-darwin-arm64.dmg',
          browser_download_url:
            'https://github.com/archestra-ai/archestra/releases/download/v1.0.0/archestra-darwin-arm64.dmg',
          size: 60000000,
        },
        {
          name: 'archestra-linux-amd64.deb',
          browser_download_url:
            'https://github.com/archestra-ai/archestra/releases/download/v1.0.0/archestra-linux-amd64.deb',
          size: 45000000,
        },
      ],
    };

    it('should fetch latest release from GitHub API', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRelease,
      });

      const result = await fetchLatestRelease();

      expect(result).toEqual(mockRelease);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/releases/latest'), {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });
    });

    it('should cache the release data', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRelease,
      });

      await fetchLatestRelease();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'archestra-latest-release',
        expect.stringContaining('"v1.0.0"')
      );
    });

    it('should return cached data if still valid', async () => {
      const cachedData = {
        data: mockRelease,
        timestamp: Date.now() - 1000, // 1 second ago
      };
      localStorageMock.store['archestra-latest-release'] = JSON.stringify(cachedData);

      const result = await fetchLatestRelease();

      expect(result).toEqual(mockRelease);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch new data if cache is expired', async () => {
      const cachedData = {
        data: mockRelease,
        timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago (expired)
      };
      localStorageMock.store['archestra-latest-release'] = JSON.stringify(cachedData);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockRelease, tag_name: 'v1.0.1' }),
      });

      const result = await fetchLatestRelease();

      expect(result?.tag_name).toBe('v1.0.1');
      expect(global.fetch).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('archestra-latest-release');
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await fetchLatestRelease();

      expect(result).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchLatestRelease();

      expect(result).toBeNull();
    });

    it('should handle invalid cache data gracefully', async () => {
      localStorageMock.store['archestra-latest-release'] = 'invalid json';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRelease,
      });

      const result = await fetchLatestRelease();

      expect(result).toEqual(mockRelease);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('findMatchingAsset', () => {
    const mockAssets: GitHubAsset[] = [
      {
        name: 'archestra-windows-x64.exe',
        browser_download_url: 'https://example.com/windows.exe',
        size: 50000000,
      },
      {
        name: 'archestra-darwin-arm64.dmg',
        browser_download_url: 'https://example.com/macos.dmg',
        size: 60000000,
      },
      {
        name: 'archestra-linux-amd64.deb',
        browser_download_url: 'https://example.com/linux.deb',
        size: 45000000,
      },
    ];

    const mockRelease: GitHubRelease = {
      id: 123456,
      tag_name: 'v1.0.0',
      name: 'Release 1.0.0',
      published_at: '2024-01-01T00:00:00Z',
      assets: mockAssets,
    };

    it('should find Windows x64 asset', () => {
      const platformInfo: PlatformInfo = {
        platform: 'windows',
        architecture: 'x64',
        displayName: 'Windows',
        filePatterns: ['windows-x64.exe', 'windows.exe', '.exe'],
      };

      const asset = findMatchingAsset(mockRelease, platformInfo);

      expect(asset).toBeDefined();
      expect(asset?.name).toBe('archestra-windows-x64.exe');
    });

    it('should find macOS ARM64 asset', () => {
      const platformInfo: PlatformInfo = {
        platform: 'macos',
        architecture: 'arm64',
        displayName: 'macOS',
        filePatterns: ['darwin-arm64.dmg', 'macos-arm64.dmg', '.dmg'],
      };

      const asset = findMatchingAsset(mockRelease, platformInfo);

      expect(asset).toBeDefined();
      expect(asset?.name).toBe('archestra-darwin-arm64.dmg');
    });

    it('should find Linux AMD64 deb asset', () => {
      const platformInfo: PlatformInfo = {
        platform: 'linux',
        architecture: 'x64',
        linuxDistro: 'deb',
        displayName: 'Linux',
        filePatterns: ['linux-amd64.deb', 'linux_amd64.deb', '.deb'],
      };

      const asset = findMatchingAsset(mockRelease, platformInfo);

      expect(asset).toBeDefined();
      expect(asset?.name).toBe('archestra-linux-amd64.deb');
    });

    it('should return null if no matching asset found', () => {
      const platformInfo: PlatformInfo = {
        platform: 'linux',
        architecture: 'x64',
        linuxDistro: 'rpm',
        displayName: 'Linux',
        filePatterns: ['linux-x64.rpm', '.rpm'],
      };

      const asset = findMatchingAsset(mockRelease, platformInfo);

      expect(asset).toBeNull();
    });

    it('should return null if release has no assets', () => {
      const emptyRelease: GitHubRelease = {
        ...mockRelease,
        assets: [],
      };

      const platformInfo: PlatformInfo = {
        platform: 'windows',
        architecture: 'x64',
        displayName: 'Windows',
        filePatterns: ['.exe'],
      };

      const asset = findMatchingAsset(emptyRelease, platformInfo);

      expect(asset).toBeNull();
    });

    it('should return first matching asset when multiple patterns match', () => {
      const platformInfo: PlatformInfo = {
        platform: 'windows',
        architecture: 'x64',
        displayName: 'Windows',
        filePatterns: ['nonexistent.exe', 'windows-x64.exe', '.exe'],
      };

      const asset = findMatchingAsset(mockRelease, platformInfo);

      expect(asset).toBeDefined();
      expect(asset?.name).toBe('archestra-windows-x64.exe');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    it('should format KB correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
      expect(formatFileSize(10240)).toBe('10 KB');
    });

    it('should format MB correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
      expect(formatFileSize(50000000)).toBe('47.68 MB');
    });

    it('should format GB correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1610612736)).toBe('1.5 GB');
      expect(formatFileSize(5368709120)).toBe('5 GB');
    });
  });
});
