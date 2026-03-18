import { describe, expect, it } from 'vitest';

import pullDocsModule from './pull-docs.js';

const { resolvePlatformDocsSource } = pullDocsModule;

describe('resolvePlatformDocsSource', () => {
  it('prefers the paired fork and matching branch when available', () => {
    const env = {
      VERCEL_GIT_REPO_OWNER: 'kennethaasan',
      VERCEL_GIT_COMMIT_REF: 'codex/3378-scheduled-agent-triggers-plan',
    };

    const source = resolvePlatformDocsSource(
      env,
      (repoUrl, ref) =>
        repoUrl === 'https://github.com/kennethaasan/archestra.git' &&
        ref === 'codex/3378-scheduled-agent-triggers-plan'
    );

    expect(source).toEqual({
      repoUrl: 'https://github.com/kennethaasan/archestra.git',
      ref: 'codex/3378-scheduled-agent-triggers-plan',
    });
  });

  it('allows explicit repo and ref overrides', () => {
    const env = {
      ARCHESTRA_DOCS_REPO_URL: 'https://github.com/example/custom-archestra.git',
      ARCHESTRA_DOCS_REF: 'feature/docs-preview',
      VERCEL_GIT_REPO_OWNER: 'kennethaasan',
      VERCEL_GIT_COMMIT_REF: 'codex/3378-scheduled-agent-triggers-plan',
    };

    const source = resolvePlatformDocsSource(
      env,
      (repoUrl, ref) => repoUrl === 'https://github.com/example/custom-archestra.git' && ref === 'feature/docs-preview'
    );

    expect(source).toEqual({
      repoUrl: 'https://github.com/example/custom-archestra.git',
      ref: 'feature/docs-preview',
    });
  });

  it('falls back to upstream main when no branch candidate exists', () => {
    const env = {
      VERCEL_GIT_REPO_OWNER: 'kennethaasan',
      VERCEL_GIT_COMMIT_REF: 'codex/3378-scheduled-agent-triggers-plan',
    };

    const source = resolvePlatformDocsSource(env, () => false);

    expect(source).toEqual({
      repoUrl: 'https://github.com/archestra-ai/archestra.git',
      ref: 'main',
    });
  });
});
