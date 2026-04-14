import fs from 'fs';
import path from 'path';

type BudgetRule = {
  label: string;
  maxBytes: number;
  matches: (relativePath: string, extension: string) => boolean;
};

type Violation = {
  budget: BudgetRule;
  bytes: number;
  extension: string;
  relativePath: string;
};

const KB = 1024;
const MB = 1024 * KB;
const publicDirectory = path.join(process.cwd(), 'public');
const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);

const budgetRules: BudgetRule[] = [
  {
    label: 'Blog GIF budget',
    maxBytes: 2 * MB,
    matches: (relativePath, extension) => relativePath.startsWith('blog/') && extension === '.gif',
  },
  {
    label: 'Blog raster budget',
    maxBytes: 750 * KB,
    matches: (relativePath, extension) => relativePath.startsWith('blog/') && extension !== '.gif',
  },
  {
    label: 'Default GIF budget',
    maxBytes: 2 * MB,
    matches: (_relativePath, extension) => extension === '.gif',
  },
  {
    label: 'Default raster budget',
    maxBytes: 1 * MB,
    matches: () => true,
  },
];

const legacyExceptions = new Set([
  'blog/2025-08-11-why-we-founded-archestra-hero.jpg',
  'blog/2025-08-20-archestra-joins-cncf-hero.png',
  'blog/2025-09-09-celebrating-100-mcp-servers-hero.png',
  'blog/2025-09-18-welcome-dominik-hero.jpg',
  'blog/2025-10-13-what-is-prompt-injection-hero.png',
  'blog/2025-12-09-platform-evolvement-image2.png',
  'blog/2025-12-28-gaggimate-mcp.png',
  'blog/2025-12-28-hoffmann.png',
  'blog/2025-12-28-machine.png',
  'blog/2025-12-28-shot-1-photo.png',
  'blog/2026-01-12-agents.gif',
  'blog/2026-01-12-hero.jpg',
  'blog/2026-01-12-ingest.gif',
  'blog/2026-01-12-install-mcp.gif',
  'blog/2026-01-12-mcp-registry.gif',
  'blog/2026-02-04-openclaw-secure-hero.png',
  'blog/2026-02-04-openclaw-matvey-prompt-injection.png',
  'blog/2026-02-11-mcp-authentication.png',
  'blog/2026-03-30-enterprise-managed-authorization-hero.png',
  'team-photo.jpg',
]);

function formatBytes(bytes: number): string {
  return `${(bytes / MB).toFixed(2)} MB`;
}

function getRecommendation(extension: string): string {
  if (extension === '.gif') {
    return 'Prefer MP4/WebM for motion, or shorten the loop and reduce the frame count.';
  }

  if (extension === '.png') {
    return 'Resize it to its rendered dimensions and switch photo-like assets to JPG/WebP.';
  }

  if (extension === '.jpg' || extension === '.jpeg') {
    return 'Resize it to the actual render size and recompress it more aggressively.';
  }

  return 'Resize it to the actual render size and lower the encoded quality.';
}

function getApplicableBudget(relativePath: string, extension: string): BudgetRule {
  const budget = budgetRules.find((rule) => rule.matches(relativePath, extension));

  if (!budget) {
    throw new Error(`No image budget matched ${relativePath}`);
  }

  return budget;
}

function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(absolutePath);
    }

    return [absolutePath];
  });
}

function getViolations(): Violation[] {
  return walk(publicDirectory)
    .map((absolutePath) => {
      const extension = path.extname(absolutePath).toLowerCase();

      if (!imageExtensions.has(extension)) {
        return undefined;
      }

      const relativePath = path.relative(publicDirectory, absolutePath).replaceAll(path.sep, '/');
      const bytes = fs.statSync(absolutePath).size;
      const budget = getApplicableBudget(relativePath, extension);

      if (bytes <= budget.maxBytes) {
        return undefined;
      }

      return {
        budget,
        bytes,
        extension,
        relativePath,
      } satisfies Violation;
    })
    .filter((violation): violation is Violation => Boolean(violation))
    .sort((left, right) => right.bytes - left.bytes);
}

const violations = getViolations();
const debt = violations.filter((violation) => legacyExceptions.has(violation.relativePath));
const failures = violations.filter((violation) => !legacyExceptions.has(violation.relativePath));

if (debt.length > 0) {
  console.log('Known oversized image debt:');
  for (const violation of debt) {
    console.log(
      `- ${violation.relativePath}: ${formatBytes(violation.bytes)} > ${formatBytes(violation.budget.maxBytes)} (${violation.budget.label})`
    );
  }
  console.log('');
}

if (failures.length === 0) {
  console.log('Image budgets passed.');
  process.exit(0);
}

console.error('Image budget failures:');
for (const violation of failures) {
  console.error(
    `- ${violation.relativePath}: ${formatBytes(violation.bytes)} > ${formatBytes(violation.budget.maxBytes)} (${violation.budget.label})`
  );
  console.error(`  ${getRecommendation(violation.extension)}`);
}

process.exit(1);
