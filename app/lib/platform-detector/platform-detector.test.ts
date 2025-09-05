import { detectPlatform, matchAssetToPattern } from './';

describe('platform-detector', () => {
  describe('detectPlatform', () => {
    beforeEach(() => {
      // Reset window mocks before each test
      vi.unstubAllGlobals();
    });

    it('should detect Windows x64 platform', () => {
      vi.stubGlobal('window', {
        navigator: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
          platform: 'Win32',
        },
      });

      const result = detectPlatform();

      expect(result.platform).toBe('windows');
      expect(result.architecture).toBe('x64');
      expect(result.displayName).toBe('Windows');
      expect(result.filePatterns).toContain('windows-x64.exe');
      expect(result.filePatterns).toContain('.exe');
    });

    it('should detect macOS x64 platform', () => {
      vi.stubGlobal('window', {
        navigator: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          platform: 'MacIntel',
        },
      });

      const result = detectPlatform();

      expect(result.platform).toBe('macos');
      expect(result.architecture).toBe('x64');
      expect(result.displayName).toBe('macOS');
      expect(result.filePatterns).toContain('darwin-x64.dmg');
      expect(result.filePatterns).toContain('.dmg');
    });

    it('should detect macOS ARM64 platform (Apple Silicon)', () => {
      vi.stubGlobal('window', {
        navigator: {
          userAgent: 'Mozilla/5.0 (Macintosh; ARM64) AppleWebKit/537.36',
          platform: 'MacIntel',
          userAgentData: {
            platform: 'macOS',
            architecture: 'arm64',
          },
        },
      });

      const result = detectPlatform();

      expect(result.platform).toBe('macos');
      expect(result.architecture).toBe('arm64');
      expect(result.displayName).toBe('macOS');
      expect(result.filePatterns).toContain('darwin-arm64.dmg');
      expect(result.filePatterns).toContain('.dmg');
    });

    it('should detect Linux x64 with deb package', () => {
      vi.stubGlobal('window', {
        navigator: {
          userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36',
          platform: 'Linux x86_64',
        },
      });

      const result = detectPlatform();

      expect(result.platform).toBe('linux');
      expect(result.architecture).toBe('x64');
      expect(result.displayName).toBe('Linux');
      expect(result.linuxDistro).toBe('deb');
      expect(result.filePatterns).toContain('linux-amd64.deb');
      expect(result.filePatterns).toContain('.deb');
    });

    it('should detect Linux ARM64 with rpm package', () => {
      vi.stubGlobal('window', {
        navigator: {
          userAgent: 'Mozilla/5.0 (X11; Fedora; Linux aarch64) AppleWebKit/537.36',
          platform: 'Linux aarch64',
        },
      });

      const result = detectPlatform();

      expect(result.platform).toBe('linux');
      expect(result.architecture).toBe('arm64');
      expect(result.displayName).toBe('Linux');
      expect(result.linuxDistro).toBe('rpm');
      expect(result.filePatterns).toContain('linux-arm64.rpm');
      expect(result.filePatterns).toContain('.rpm');
    });

    it('should return unknown platform when detection fails', () => {
      vi.stubGlobal('window', {
        navigator: {
          userAgent: 'Unknown/1.0',
          platform: 'Unknown',
        },
      });

      const result = detectPlatform();

      expect(result.platform).toBe('unknown');
      expect(result.architecture).toBe('unknown');
      expect(result.displayName).toBe('your platform');
      expect(result.filePatterns).toEqual([]);
    });

    it('should handle server-side rendering (no window object)', () => {
      // window is undefined by default in test environment
      const result = detectPlatform();

      expect(result.platform).toBe('unknown');
      expect(result.architecture).toBe('unknown');
      expect(result.displayName).toBe('your platform');
      expect(result.filePatterns).toEqual([]);
    });
  });

  describe('matchAssetToPattern', () => {
    it('should match file extension patterns', () => {
      expect(matchAssetToPattern('archestra-setup.exe', ['.exe'])).toBe(true);
      expect(matchAssetToPattern('archestra-1.0.0.dmg', ['.dmg'])).toBe(true);
      expect(matchAssetToPattern('archestra_1.0.0_amd64.deb', ['.deb'])).toBe(true);
    });

    it('should match full name patterns', () => {
      expect(matchAssetToPattern('archestra-windows-x64.exe', ['windows-x64.exe'])).toBe(true);
      expect(matchAssetToPattern('archestra-darwin-arm64.dmg', ['darwin-arm64.dmg'])).toBe(true);
      expect(matchAssetToPattern('archestra-linux-amd64.deb', ['linux-amd64.deb'])).toBe(true);
    });

    it('should match partial name patterns', () => {
      expect(matchAssetToPattern('archestra-windows.exe', ['windows.exe'])).toBe(true);
      expect(matchAssetToPattern('archestra-macos.dmg', ['macos.dmg'])).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(matchAssetToPattern('Archestra-Windows-X64.EXE', ['windows-x64.exe'])).toBe(true);
      expect(matchAssetToPattern('ARCHESTRA.DMG', ['.dmg'])).toBe(true);
    });

    it('should not match incorrect patterns', () => {
      expect(matchAssetToPattern('archestra.exe', ['.dmg'])).toBe(false);
      expect(matchAssetToPattern('archestra-linux.deb', ['windows-x64.exe'])).toBe(false);
      expect(matchAssetToPattern('archestra.zip', ['.exe', '.dmg', '.deb'])).toBe(false);
    });

    it('should try multiple patterns in order', () => {
      const patterns = ['darwin-arm64.dmg', 'darwin-x64.dmg', '.dmg'];
      expect(matchAssetToPattern('archestra-darwin-arm64.dmg', patterns)).toBe(true);
      expect(matchAssetToPattern('archestra-darwin-x64.dmg', patterns)).toBe(true);
      expect(matchAssetToPattern('archestra.dmg', patterns)).toBe(true);
    });
  });
});
