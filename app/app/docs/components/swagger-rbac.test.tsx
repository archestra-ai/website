import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SwaggerRbacPermissions, extractRequiredPermissions } from './swagger-rbac';

describe('extractRequiredPermissions', () => {
  it('reads x-required-permissions from plain objects', () => {
    expect(
      extractRequiredPermissions({
        operationProps: {
          op: {
            'x-required-permissions': {
              permissions: ['toolPolicy:read', 'team:update'],
              note: 'Checked dynamically',
            },
          },
        },
      })
    ).toEqual({
      note: 'Checked dynamically',
      permissions: ['toolPolicy:read', 'team:update'],
    });
  });

  it('reads x-required-permissions from immutable-style get() records', () => {
    const makeRecord = (value: Record<string, unknown>) => ({
      get: (key: string) => value[key],
    });

    expect(
      extractRequiredPermissions({
        operationProps: makeRecord({
          op: makeRecord({
            'x-required-permissions': makeRecord({
              permissions: {
                toJS: () => ['mcpRegistry:read'],
              },
            }),
          }),
        }),
      })
    ).toEqual({
      note: undefined,
      permissions: ['mcpRegistry:read'],
    });
  });
});

describe('SwaggerRbacPermissions', () => {
  it('renders permission badges', () => {
    render(<SwaggerRbacPermissions metadata={{ permissions: ['toolPolicy:read'] }} />);

    expect(screen.getByTestId('swagger-rbac-permissions')).toBeInTheDocument();
    expect(screen.getByText('RBAC')).toBeInTheDocument();
    expect(screen.getByText('toolPolicy:read')).toBeInTheDocument();
  });

  it('renders note-only RBAC metadata', () => {
    render(
      <SwaggerRbacPermissions
        metadata={{
          note: 'None (no additional RBAC permission required)',
          permissions: [],
        }}
      />
    );

    expect(screen.getByText('None (no additional RBAC permission required)')).toBeInTheDocument();
  });

  it('renders nothing when there are no permissions', () => {
    const { container } = render(<SwaggerRbacPermissions metadata={{ permissions: [] }} />);

    expect(container).toBeEmptyDOMElement();
  });
});
