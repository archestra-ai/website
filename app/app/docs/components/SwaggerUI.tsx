'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'swagger-ui-react/swagger-ui.css';

import {
  DEFAULT_PLAYGROUND_SETTINGS,
  SWAGGER_PLAYGROUND_STORAGE_KEY,
  type SwaggerPlaygroundSettings,
  type SwaggerRequest,
  applyPlaygroundSettings,
  parseStoredPlaygroundSettings,
  serializePlaygroundSettings,
} from './swagger-playground';
import { createSwaggerRbacPlugin } from './swagger-rbac';

// Dynamically import swagger-ui-react to avoid SSR issues
const SwaggerUIReact = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-pulse text-gray-500">Loading API documentation...</div>
    </div>
  ),
});

interface SwaggerUIProps {
  specUrl?: string;
}

const swaggerRbacPlugin = createSwaggerRbacPlugin();
const SUPPORTED_SUBMIT_METHODS: Array<'delete' | 'get' | 'head' | 'options' | 'patch' | 'post' | 'put'> = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
];
const PLAYGROUND_APPLY_DEBOUNCE_MS = 350;

export default function SwaggerUI({ specUrl = '/docs/openapi.json' }: SwaggerUIProps) {
  const [mounted, setMounted] = useState(false);
  const [playground, setPlayground] = useState<SwaggerPlaygroundSettings>(DEFAULT_PLAYGROUND_SETTINGS);
  const [appliedPlayground, setAppliedPlayground] =
    useState<SwaggerPlaygroundSettings>(DEFAULT_PLAYGROUND_SETTINGS);

  useEffect(() => {
    setMounted(true);

    const storedSettings = window.localStorage.getItem(SWAGGER_PLAYGROUND_STORAGE_KEY);
    const parsedSettings = parseStoredPlaygroundSettings(storedSettings);
    setPlayground(parsedSettings);
    setAppliedPlayground(parsedSettings);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    window.localStorage.setItem(SWAGGER_PLAYGROUND_STORAGE_KEY, serializePlaygroundSettings(playground));
  }, [mounted, playground]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAppliedPlayground(playground);
    }, PLAYGROUND_APPLY_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [mounted, playground]);

  const isApplyingPlaygroundSettings =
    playground.enabled !== appliedPlayground.enabled ||
    playground.baseUrl !== appliedPlayground.baseUrl ||
    playground.apiKey !== appliedPlayground.apiKey;

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-500">Loading API documentation...</div>
      </div>
    );
  }

  return (
    <div className="swagger-ui-wrapper">
      <style jsx global>{`
        /* Custom styles to integrate Swagger UI with the docs theme */
        .swagger-ui-wrapper .archestra-swagger-playground {
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
          padding: 20px;
        }

        .swagger-ui-wrapper .archestra-swagger-playground__header {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .swagger-ui-wrapper .archestra-swagger-playground__title {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
        }

        .swagger-ui-wrapper .archestra-swagger-playground__toggle {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          font-size: 14px;
          color: #374151;
        }

        .swagger-ui-wrapper .archestra-swagger-playground__description {
          font-size: 14px;
          color: #4b5563;
          margin-bottom: 16px;
        }

        .swagger-ui-wrapper .archestra-swagger-playground__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }

        .swagger-ui-wrapper .archestra-swagger-playground__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .swagger-ui-wrapper .archestra-swagger-playground__field label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #6b7280;
        }

        .swagger-ui-wrapper .archestra-swagger-playground__field input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 10px 12px;
          background: #ffffff;
          color: #111827;
        }

        .swagger-ui-wrapper .archestra-swagger-playground__hint {
          margin-top: 12px;
          font-size: 13px;
          color: #6b7280;
        }

        .swagger-ui-wrapper .archestra-swagger-playground__status {
          margin-top: 10px;
          font-size: 13px;
          color: #2563eb;
        }

        .swagger-ui-wrapper .swagger-ui {
          font-family: inherit;
        }

        .swagger-ui-wrapper .swagger-ui .info {
          margin: 20px 0;
        }

        .swagger-ui-wrapper .swagger-ui .info .title {
          font-size: 2rem;
          color: #111827;
        }

        .swagger-ui-wrapper .swagger-ui .info .description {
          font-size: 1rem;
          color: #4b5563;
        }

        .swagger-ui-wrapper .swagger-ui .opblock-tag {
          font-size: 1.25rem;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }

        .swagger-ui-wrapper .swagger-ui .opblock {
          border-radius: 8px;
          box-shadow: none;
          border: 1px solid #e5e7eb;
          margin-bottom: 12px;
        }

        .swagger-ui-wrapper .swagger-ui .opblock .opblock-summary {
          border-radius: 8px;
        }

        .swagger-ui-wrapper .swagger-ui .archestra-rbac-permissions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: flex-start;
          padding: 0 16px 14px;
          margin-top: -2px;
        }

        .swagger-ui-wrapper .swagger-ui .archestra-rbac-permissions__label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #6b7280;
        }

        .swagger-ui-wrapper .swagger-ui .archestra-rbac-permissions__content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .swagger-ui-wrapper .swagger-ui .archestra-rbac-permissions__badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .swagger-ui-wrapper .swagger-ui .archestra-rbac-permissions__badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 9999px;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #374151;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.4;
        }

        .swagger-ui-wrapper .swagger-ui .archestra-rbac-permissions__note {
          font-size: 13px;
          color: #4b5563;
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-get {
          border-color: #93c5fd;
          background: rgba(59, 130, 246, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-post {
          border-color: #86efac;
          background: rgba(34, 197, 94, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-put {
          border-color: #fcd34d;
          background: rgba(234, 179, 8, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-patch {
          border-color: #c4b5fd;
          background: rgba(139, 92, 246, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-delete {
          border-color: #fca5a5;
          background: rgba(239, 68, 68, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .btn {
          border-radius: 6px;
        }

        .swagger-ui-wrapper .swagger-ui select {
          border-radius: 6px;
        }

        .swagger-ui-wrapper .swagger-ui input[type='text'],
        .swagger-ui-wrapper .swagger-ui textarea {
          border-radius: 6px;
        }

        .swagger-ui-wrapper .swagger-ui input[disabled],
        .swagger-ui-wrapper .swagger-ui select[disabled],
        .swagger-ui-wrapper .swagger-ui textarea[disabled] {
          cursor: text;
        }

        .swagger-ui-wrapper .swagger-ui .model-box {
          border-radius: 8px;
        }

        .swagger-ui-wrapper .swagger-ui table tbody tr td {
          padding: 12px;
        }

        /* Hide the info/description section since we have our own */
        .swagger-ui-wrapper .swagger-ui .info {
          display: none;
        }
      `}</style>
      <div className="archestra-swagger-playground">
        <div className="archestra-swagger-playground__header">
          <div className="archestra-swagger-playground__title">Playground Mode</div>
          <label className="archestra-swagger-playground__toggle">
            <input
              checked={playground.enabled}
              onChange={(event) =>
                setPlayground((current) => ({
                  ...current,
                  enabled: event.target.checked,
                }))
              }
              type="checkbox"
            />
            Enable live requests
          </label>
        </div>
        <p className="archestra-swagger-playground__description">
          Route requests to your backend and inject your raw Archestra API key into the <code>Authorization</code>{' '}
          header. Do not prefix the key with <code>Bearer</code>.
        </p>
        <div className="archestra-swagger-playground__grid">
          <div className="archestra-swagger-playground__field">
            <label htmlFor="swagger-playground-base-url">Base URL</label>
            <input
              id="swagger-playground-base-url"
              onChange={(event) =>
                setPlayground((current) => ({
                  ...current,
                  baseUrl: event.target.value,
                }))
              }
              placeholder="http://localhost:9000"
              type="text"
              value={playground.baseUrl}
            />
          </div>
          <div className="archestra-swagger-playground__field">
            <label htmlFor="swagger-playground-api-key">API Key</label>
            <input
              id="swagger-playground-api-key"
              onChange={(event) =>
                setPlayground((current) => ({
                  ...current,
                  apiKey: event.target.value,
                }))
              }
              placeholder="Paste API key"
              type="password"
              value={playground.apiKey}
            />
          </div>
        </div>
        <p className="archestra-swagger-playground__hint">
          Try it out is enabled only while playground mode is on. Settings stay in your browser on this machine.
        </p>
        {isApplyingPlaygroundSettings ? (
          <p className="archestra-swagger-playground__status">Updating playground…</p>
        ) : null}
      </div>
      <SwaggerUIReact
        key={[
          specUrl,
          appliedPlayground.enabled ? "enabled" : "disabled",
          appliedPlayground.baseUrl,
          appliedPlayground.apiKey,
        ].join(":")}
        url={specUrl}
        defaultModelsExpandDepth={-1}
        plugins={[swaggerRbacPlugin]}
        requestInterceptor={(request) =>
          applyPlaygroundSettings({
            request: request as SwaggerRequest,
            settings: appliedPlayground,
            specUrl,
          })
        }
        supportedSubmitMethods={appliedPlayground.enabled ? SUPPORTED_SUBMIT_METHODS : []}
        tryItOutEnabled={appliedPlayground.enabled}
      />
    </div>
  );
}
