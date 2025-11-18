import fs from 'fs';
import path from 'path';

export interface DocsPathConfig {
  docsDirectory: string;
  assetsDirectory: string;
  isLocalDevelopment: boolean;
}

/**
 * Determines the correct path for docs based on the environment
 * Priority order:
 * 1. Local archestra repo (../../archestra/docs) - for local development
 * 2. Pulled docs (.platform-docs) - for production/CI or when local doesn't exist
 * 3. Returns null if no docs are available
 */
export function getDocsPath(): DocsPathConfig | null {
  // Check for local development docs first
  const localDocsPath = path.join(process.cwd(), '../../archestra/docs');
  if (fs.existsSync(localDocsPath)) {
    return {
      docsDirectory: path.join(localDocsPath, 'pages'),
      assetsDirectory: path.join(localDocsPath, 'assets/old_docs'),
      isLocalDevelopment: true,
    };
  }

  // Check for pulled docs (used in production or when local doesn't exist)
  const pulledDocsPath = path.join(process.cwd(), '.platform-docs');
  if (fs.existsSync(pulledDocsPath)) {
    return {
      docsDirectory: path.join(pulledDocsPath, 'pages'),
      assetsDirectory: path.join(pulledDocsPath, 'assets/old_docs'),
      isLocalDevelopment: false,
    };
  }

  // No docs available
  return null;
}

/**
 * Gets the docs directory path or returns null if not available
 */
export function getDocsDirectory(): string | null {
  const config = getDocsPath();
  return config?.docsDirectory || null;
}

/**
 * Gets the assets directory path or returns null if not available
 */
export function getAssetsDirectory(): string | null {
  const config = getDocsPath();
  return config?.assetsDirectory || null;
}
