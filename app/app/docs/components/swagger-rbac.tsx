'use client';

import React from 'react';

// === Exports ===

export function SwaggerRbacPermissions({ permissions }: { permissions: string[] }) {
  if (permissions.length === 0) {
    return null;
  }

  return (
    <div className="archestra-rbac-permissions" data-testid="swagger-rbac-permissions">
      <span className="archestra-rbac-permissions__label">Requires</span>
      <div className="archestra-rbac-permissions__badges">
        {permissions.map((permission) => (
          <span key={permission} className="archestra-rbac-permissions__badge">
            {permission}
          </span>
        ))}
      </div>
    </div>
  );
}

export function createSwaggerRbacPlugin() {
  return () => ({
    wrapComponents: {
      OperationSummary: (Original: React.ComponentType<unknown>) => (props: unknown) => {
        const permissions = extractRequiredPermissions(props);

        return (
          <>
            <Original {...(props as object)} />
            <SwaggerRbacPermissions permissions={permissions} />
          </>
        );
      },
    },
  });
}

export function extractRequiredPermissions(operationSummaryProps: unknown): string[] {
  const operationProps = getRecordValue(operationSummaryProps, 'operationProps');
  const operation = getRecordValue(operationProps, 'op');
  const extension = getRecordValue(operation, 'x-required-permissions');
  const allOf = getRecordValue(extension, 'allOf');

  if (Array.isArray(allOf)) {
    return allOf.filter((value): value is string => typeof value === 'string');
  }

  if (hasToJs(allOf)) {
    const values = allOf.toJS();
    if (Array.isArray(values)) {
      return values.filter((value): value is string => typeof value === 'string');
    }
  }

  return [];
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
