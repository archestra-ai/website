'use client';

import React from 'react';

// === Exports ===

type SwaggerRbacMetadata = {
  note?: string;
  permissions: string[];
};

export function createSwaggerRbacPlugin() {
  return () => ({
    wrapComponents: {
      OperationSummary: (Original: React.ComponentType<unknown>) => (props: unknown) => {
        const metadata = extractRequiredPermissions(props);

        return (
          <>
            <Original {...(props as object)} />
            <SwaggerRbacPermissions metadata={metadata} />
          </>
        );
      },
    },
  });
}

export function extractRequiredPermissions(operationSummaryProps: unknown): SwaggerRbacMetadata {
  const operationProps = getRecordValue(operationSummaryProps, 'operationProps');
  const operation = getRecordValue(operationProps, 'op');
  const extension = getRecordValue(operation, 'x-required-permissions');
  const permissions = getRecordValue(extension, 'permissions');
  const note = getStringValue(getRecordValue(extension, 'note'));

  if (Array.isArray(permissions)) {
    return {
      note,
      permissions: permissions.filter((value): value is string => typeof value === 'string'),
    };
  }

  if (hasToJs(permissions)) {
    const values = permissions.toJS();
    if (Array.isArray(values)) {
      return {
        note,
        permissions: values.filter((value): value is string => typeof value === 'string'),
      };
    }
  }

  return {
    note,
    permissions: [],
  };
}

export function SwaggerRbacPermissions({ metadata }: { metadata: SwaggerRbacMetadata }) {
  if (metadata.permissions.length === 0 && !metadata.note) {
    return null;
  }

  return (
    <div className="archestra-rbac-permissions" data-testid="swagger-rbac-permissions">
      <span className="archestra-rbac-permissions__label">RBAC</span>
      <div className="archestra-rbac-permissions__content">
        {metadata.permissions.length > 0 ? (
          <div className="archestra-rbac-permissions__badges">
            {metadata.permissions.map((permission) => (
              <span key={permission} className="archestra-rbac-permissions__badge">
                {permission}
              </span>
            ))}
          </div>
        ) : null}
        {metadata.note ? <span className="archestra-rbac-permissions__note">{metadata.note}</span> : null}
      </div>
    </div>
  );
}

// === Internal helpers ===

function getRecordValue(source: unknown, key: string): unknown {
  if (!source) {
    return undefined;
  }

  if (typeof source === 'object' && source !== null && key in source) {
    return (source as Record<string, unknown>)[key];
  }

  if (
    typeof source === 'object' &&
    source !== null &&
    'get' in source &&
    typeof (source as { get?: unknown }).get === 'function'
  ) {
    return (source as { get: (value: string) => unknown }).get(key);
  }

  return undefined;
}

function hasToJs(value: unknown): value is { toJS: () => unknown } {
  return typeof value === 'object' && value !== null && 'toJS' in value && typeof value.toJS === 'function';
}

function getStringValue(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  return undefined;
}
