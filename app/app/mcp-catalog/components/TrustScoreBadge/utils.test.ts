import { generateBadgeAbsoluteUrl, generateBadgeMarkdown, generateBadgeRelativeUrl } from './utils';

describe('trustScoreBadge utils', () => {
  describe('generateBadgeRelativeUrl', () => {
    it('should generate correct relative URL without path', () => {
      const result = generateBadgeRelativeUrl('archestra-ai', 'website');
      expect(result).toBe('/mcp-catalog/api/badge/quality/archestra-ai/website');
    });

    it('should generate correct relative URL with path', () => {
      const result = generateBadgeRelativeUrl('modelcontextprotocol', 'servers', 'src/sqlite');
      expect(result).toBe('/mcp-catalog/api/badge/quality/modelcontextprotocol/servers/src--sqlite');
    });

    it('should handle multiple slashes in path', () => {
      const result = generateBadgeRelativeUrl('example', 'repo', 'src/deep/nested/path');
      expect(result).toBe('/mcp-catalog/api/badge/quality/example/repo/src--deep--nested--path');
    });

    it('should handle null path', () => {
      const result = generateBadgeRelativeUrl('owner', 'repo', null);
      expect(result).toBe('/mcp-catalog/api/badge/quality/owner/repo');
    });
  });

  describe('generateBadgeAbsoluteUrl', () => {
    it('should generate correct absolute URL without path', () => {
      const result = generateBadgeAbsoluteUrl('archestra-ai', 'website');
      expect(result).toBe('https://archestra.ai/mcp-catalog/api/badge/quality/archestra-ai/website');
    });

    it('should generate correct absolute URL with path', () => {
      const result = generateBadgeAbsoluteUrl('modelcontextprotocol', 'servers', 'src/sqlite');
      expect(result).toBe(
        'https://archestra.ai/mcp-catalog/api/badge/quality/modelcontextprotocol/servers/src--sqlite'
      );
    });

    it('should handle null path', () => {
      const result = generateBadgeAbsoluteUrl('owner', 'repo', null);
      expect(result).toBe('https://archestra.ai/mcp-catalog/api/badge/quality/owner/repo');
    });
  });

  describe('generateBadgeMarkdown', () => {
    it('should generate correct markdown without path and without serverName', () => {
      const result = generateBadgeMarkdown('archestra-ai', 'website');
      expect(result).toBe(
        '[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/archestra-ai/website)](https://archestra.ai/mcp-catalog/archestra-ai__website)'
      );
    });

    it('should generate correct markdown with path but without serverName', () => {
      const result = generateBadgeMarkdown('modelcontextprotocol', 'servers', 'src/sqlite');
      expect(result).toBe(
        '[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/modelcontextprotocol/servers/src--sqlite)](https://archestra.ai/mcp-catalog/modelcontextprotocol__servers)'
      );
    });

    it('should generate correct markdown with serverName', () => {
      const result = generateBadgeMarkdown('archestra-ai', 'website', null, 'archestra-ai__website');
      expect(result).toBe(
        '[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/archestra-ai/website)](https://archestra.ai/mcp-catalog/archestra-ai__website)'
      );
    });

    it('should generate correct markdown with path and serverName', () => {
      const result = generateBadgeMarkdown(
        'modelcontextprotocol',
        'servers',
        'src/sqlite',
        'modelcontextprotocol__servers__src__sqlite'
      );
      expect(result).toBe(
        '[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/modelcontextprotocol/servers/src--sqlite)](https://archestra.ai/mcp-catalog/modelcontextprotocol__servers__src__sqlite)'
      );
    });

    it('should handle special characters in owner and repo names', () => {
      const result = generateBadgeMarkdown('user-123', 'repo_name');
      expect(result).toBe(
        '[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/user-123/repo_name)](https://archestra.ai/mcp-catalog/user-123__repo_name)'
      );
    });
  });
});
