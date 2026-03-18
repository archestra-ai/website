import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PLAYGROUND_SETTINGS,
  applyPlaygroundSettings,
  parseStoredPlaygroundSettings,
  rewriteRequestUrl,
} from './swagger-playground';

describe('rewriteRequestUrl', () => {
  it('rewrites absolute request URLs to the configured base URL', () => {
    expect(
      rewriteRequestUrl({
        baseUrl: 'http://localhost:9000/',
        requestUrl: 'http://localhost:3001/api/tools?limit=10',
      })
    ).toBe('http://localhost:9000/api/tools?limit=10');
  });

  it('rewrites relative request URLs to the configured base URL', () => {
    expect(
      rewriteRequestUrl({
        baseUrl: 'http://localhost:9000',
        requestUrl: '/api/tools',
      })
    ).toBe('http://localhost:9000/api/tools');
  });

  it('adds http:// when the configured base URL is missing a scheme', () => {
    expect(
      rewriteRequestUrl({
        baseUrl: 'localhost:9000',
        requestUrl: '/api/tools',
      })
    ).toBe('http://localhost:9000/api/tools');
  });
});

describe('applyPlaygroundSettings', () => {
  it('rewrites operation requests and injects the raw Authorization header', () => {
    expect(
      applyPlaygroundSettings({
        request: {
          headers: {
            Accept: 'application/json',
          },
          url: 'http://localhost:3001/api/tools',
        },
        settings: {
          ...DEFAULT_PLAYGROUND_SETTINGS,
          apiKey: 'test-api-key',
          baseUrl: 'http://localhost:9000',
          enabled: true,
        },
        specUrl: '/docs/openapi.json',
      })
    ).toEqual({
      headers: {
        Accept: 'application/json',
        Authorization: 'test-api-key',
      },
      url: 'http://localhost:9000/api/tools',
    });
  });

  it('leaves the spec fetch request alone', () => {
    expect(
      applyPlaygroundSettings({
        request: {
          url: 'http://localhost:3001/docs/openapi.json',
        },
        settings: {
          ...DEFAULT_PLAYGROUND_SETTINGS,
          enabled: true,
        },
        specUrl: '/docs/openapi.json',
      })
    ).toEqual({
      url: 'http://localhost:3001/docs/openapi.json',
    });
  });
});

describe('parseStoredPlaygroundSettings', () => {
  it('falls back to defaults when storage is empty or invalid', () => {
    expect(parseStoredPlaygroundSettings(null)).toEqual(DEFAULT_PLAYGROUND_SETTINGS);
    expect(parseStoredPlaygroundSettings('{')).toEqual(DEFAULT_PLAYGROUND_SETTINGS);
  });
});
