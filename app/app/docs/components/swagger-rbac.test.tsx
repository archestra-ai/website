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
              allOf: ['toolPolicy:read', 'team:update'],
            },
          },
        },
      })
    ).toEqual(['toolPolicy:read', 'team:update']);
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
              allOf: {
                toJS: () => ['mcpRegistry:read'],
              },
            }),
          }),
        }),
      })
    ).toEqual(['mcpRegistry:read']);
  });
});

describe('SwaggerRbacPermissions', () => {
  it('renders permission badges', () => {
    render(<SwaggerRbacPermissions permissions={['toolPolicy:read']} />);

    expect(screen.getByTestId('swagger-rbac-permissions')).toBeInTheDocument();
    expect(screen.getByText('Requires')).toBeInTheDocument();
    expect(screen.getByText('toolPolicy:read')).toBeInTheDocument();
  });

  it('renders nothing when there are no permissions', () => {
    const { container } = render(<SwaggerRbacPermissions permissions={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
