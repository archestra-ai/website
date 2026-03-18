'use client';

// === Exports ===

export const DEFAULT_PLAYGROUND_BASE_URL = 'http://localhost:9000';

export const DEFAULT_PLAYGROUND_SETTINGS: SwaggerPlaygroundSettings = {
  apiKey: '',
  baseUrl: DEFAULT_PLAYGROUND_BASE_URL,
  enabled: false,
};

export const SWAGGER_PLAYGROUND_STORAGE_KEY = 'archestra-docs-swagger-playground';

export type SwaggerPlaygroundSettings = {
  apiKey: string;
  baseUrl: string;
  enabled: boolean;
};

export type SwaggerRequest = {
  headers?: Record<string, string>;
  loadSpec?: boolean;
  url?: string;
};

export function applyPlaygroundSettings(params: {
  request: SwaggerRequest;
  settings: SwaggerPlaygroundSettings;
  specUrl: string;
}): SwaggerRequest {
  const { request, settings, specUrl } = params;
  if (!settings.enabled || !request.url || request.loadSpec) {
    return request;
  }

  if (isSpecRequest(request.url, specUrl)) {
    return request;
  }

  const rewrittenUrl = rewriteRequestUrl({
    baseUrl: settings.baseUrl,
    requestUrl: request.url,
  });
  if (!rewrittenUrl) {
    return request;
  }

  const headers = {
    ...(request.headers ?? {}),
  };
  const apiKey = settings.apiKey.trim();
  if (apiKey) {
    headers.Authorization = apiKey;
  }

  return {
    ...request,
    headers,
    url: rewrittenUrl,
  };
}

export function parseStoredPlaygroundSettings(value: string | null): SwaggerPlaygroundSettings {
  if (!value) {
    return DEFAULT_PLAYGROUND_SETTINGS;
  }

  try {
    const parsed = JSON.parse(value);
    if (!isPlaygroundSettings(parsed)) {
      return DEFAULT_PLAYGROUND_SETTINGS;
    }

    return {
      apiKey: parsed.apiKey,
      baseUrl: parsed.baseUrl || DEFAULT_PLAYGROUND_BASE_URL,
      enabled: parsed.enabled,
    };
  } catch {
    return DEFAULT_PLAYGROUND_SETTINGS;
  }
}

export function serializePlaygroundSettings(settings: SwaggerPlaygroundSettings): string {
  return JSON.stringify(settings);
}

export function rewriteRequestUrl(params: { baseUrl: string; requestUrl: string }): string | null {
  const normalizedBaseUrl = normalizeBaseUrl(params.baseUrl);
  if (!normalizedBaseUrl) {
    return null;
  }

  const parsedUrl = tryParseUrl(params.requestUrl);
  if (parsedUrl) {
    return `${normalizedBaseUrl}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  }

  if (params.requestUrl.startsWith('/')) {
    return `${normalizedBaseUrl}${params.requestUrl}`;
  }

  return `${normalizedBaseUrl}/${params.requestUrl.replace(/^\/+/, '')}`;
}

// === Internal helpers ===

function isSpecRequest(requestUrl: string, specUrl: string): boolean {
  const parsedUrl = tryParseUrl(requestUrl);
  const pathname = parsedUrl?.pathname ?? requestUrl;

  return pathname === specUrl || pathname.endsWith(specUrl);
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

function tryParseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isPlaygroundSettings(value: unknown): value is SwaggerPlaygroundSettings {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return typeof record.enabled === 'boolean' && typeof record.baseUrl === 'string' && typeof record.apiKey === 'string';
}
