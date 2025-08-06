import { describe, expect, it } from 'vitest';

import { GET } from './route';

describe('/mcp-catalog/api/docs', () => {
  it('should return a valid OpenAPI specification', async () => {
    const response = await GET();
    const data = await response.json();

    // Check response status
    expect(response.status).toBe(200);

    // Check OpenAPI structure
    expect(data).toHaveProperty('openapi');
    expect(data.openapi).toBe('3.0.0');

    expect(data).toHaveProperty('info');
    expect(data.info).toHaveProperty('title', 'MCP Catalog API');
    expect(data.info).toHaveProperty('version', '1.0.0');
    expect(data.info).toHaveProperty('description');

    expect(data).toHaveProperty('servers');
    expect(Array.isArray(data.servers)).toBe(true);
    expect(data.servers.length).toBeGreaterThan(0);

    expect(data).toHaveProperty('paths');
    expect(typeof data.paths).toBe('object');

    // Check for expected endpoints
    expect(data.paths).toHaveProperty('/search');
    expect(data.paths).toHaveProperty('/server/{name}');
    expect(data.paths).toHaveProperty('/badge/quality/{org}/{repo}');
  });

  it('should include proper schema definitions', async () => {
    const response = await GET();
    const data = await response.json();

    // Check for components/schemas
    if (data.components && data.components.schemas) {
      expect(typeof data.components.schemas).toBe('object');
    }

    // Check that paths have proper request/response definitions
    expect(data.paths['/search'].get).toHaveProperty('summary');
    expect(data.paths['/search'].get).toHaveProperty('responses');
    expect(data.paths['/search'].get.responses).toHaveProperty('200');
  });
});
