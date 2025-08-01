import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';

/**
 * Extract swagger definitions from route files
 */
function extractSwaggerFromFile(filePath: string): any[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const swaggerBlocks: any[] = [];
  
  // Find all @swagger comment blocks
  const regex = /\/\*\*\s*\n([^*]|\*(?!\/))*@swagger\s*\n([\s\S]*?)\*\//g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const swaggerContent = match[2];
    // Remove leading asterisks and spaces from each line
    const cleanedContent = swaggerContent
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, ''))
      .join('\n')
      .trim();
    
    try {
      // Parse as YAML
      const parsed = parse(cleanedContent);
      swaggerBlocks.push(parsed);
    } catch (e) {
      console.error(`Error parsing swagger in ${filePath}:`, e);
    }
  }
  
  return swaggerBlocks;
}

/**
 * Find all route files in the API directory
 */
function findRouteFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findRouteFiles(fullPath));
    } else if (item === 'route.ts' || item === 'route.js') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Generate OpenAPI specification from route files
 */
export function generateOpenAPISpec() {
  const apiDir = path.join(process.cwd(), 'app/mcp-catalog/api');
  
  // Base OpenAPI structure - minimal, everything else comes from JSDoc
  const spec = {
    openapi: "3.0.0",
    paths: {} as any,
  };
  
  // Find and parse all route files
  const routeFiles = findRouteFiles(apiDir);
  
  for (const file of routeFiles) {
    const swaggerDefs = extractSwaggerFromFile(file);
    
    // Merge swagger definitions into the spec
    for (const def of swaggerDefs) {
      if (def && typeof def === 'object') {
        // Deep merge the definitions
        mergeDeep(spec, def);
      }
    }
  }
  
  return spec;
}

/**
 * Deep merge objects
 */
function mergeDeep(target: any, source: any): any {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}