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
  message?: string;
  relativePath: string;
};

const KB = 1024;
const MB = 1024 * KB;
const publicDirectory = path.join(process.cwd(), 'public');
const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);

const budgetRules: BudgetRule[] = [
  {
    label: 'Blog WebP budget',
    maxBytes: 500 * KB,
    matches: (relativePath, extension) => relativePath.startsWith('blog/') && extension === '.webp',
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

function formatBytes(bytes: number): string {
  return `${(bytes / MB).toFixed(2)} MB`;
}

function getRecommendation(extension: string): string {
  if (extension === '.webp') {
    return 'Resize it to the actual render size or lower the encoded quality.';
  }

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
    .flatMap((absolutePath): Violation[] => {
      const extension = path.extname(absolutePath).toLowerCase();

      if (!imageExtensions.has(extension)) {
        return [];
      }

      const relativePath = path.relative(publicDirectory, absolutePath).replaceAll(path.sep, '/');
      const bytes = fs.statSync(absolutePath).size;

      if (relativePath.startsWith('blog/') && extension !== '.webp') {
        return [
          {
            budget: {
              label: 'Blog format rule',
              maxBytes: 0,
              matches: () => true,
            },
            bytes,
            extension,
            message: 'Convert this file to .webp. Blog images must use .webp only.',
            relativePath,
          } satisfies Violation,
        ];
      }

      const budget = getApplicableBudget(relativePath, extension);

      if (bytes <= budget.maxBytes) {
        return [];
      }

      return [
        {
          budget,
          bytes,
          extension,
          relativePath,
        } satisfies Violation,
      ];
    })
    .sort((left, right) => right.bytes - left.bytes);
}

const violations = getViolations();

if (violations.length === 0) {
  console.log('Image budgets passed.');
  process.exit(0);
}

console.error('Image budget failures:');
for (const violation of violations) {
  console.error(
    `- ${violation.relativePath}: ${formatBytes(violation.bytes)} > ${formatBytes(violation.budget.maxBytes)} (${violation.budget.label})`
  );
  console.error(`  ${violation.message ?? getRecommendation(violation.extension)}`);
}

process.exit(1);
