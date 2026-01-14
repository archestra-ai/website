import fs from 'fs';
import matter from 'gray-matter';
import type { Metadata } from 'next';
import path from 'path';
import readingTime from 'reading-time';

import { getDocsDirectory } from './lib/get-docs-path';
import { DocCategory, DocFrontMatter, DocNavItem, DocPage, DocSubcategory, TableOfContentsItem } from './types';

/**
 * Generates metadata for a documentation page including OpenGraph and Twitter card data.
 * Extracted for testability.
 */
export function buildDocMetadata(doc: DocPage | undefined, origin: string, companyName: string): Metadata {
  if (!doc) {
    return {
      title: `Documentation Not Found | ${companyName}`,
      description: `${companyName} documentation page not found.`,
      openGraph: {
        title: `Documentation Not Found | ${companyName}`,
        description: `${companyName} documentation page not found.`,
      },
    };
  }

  const description = doc.description || `${doc.title} documentation for ${companyName}.`;
  const imageUrl = `${origin}/docs/${doc.slug}/opengraph-image`;
  const imageAlt = `${doc.title} | ${companyName} Docs`;

  return {
    title: `${doc.title} | ${companyName} Docs`,
    description,
    metadataBase: new URL(origin),
    openGraph: {
      title: doc.title,
      description,
      type: 'article',
      publishedTime: doc.lastUpdated,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
      url: `${origin}/docs/${doc.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: doc.title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
  };
}

/**
 * Converts a lastUpdated value to an ISO string.
 * gray-matter parses YAML dates (e.g., 2025-10-08) as Date objects,
 * but Next.js metadata expects strings.
 */
function normalizeLastUpdated(lastUpdated: string | Date | undefined): string {
  if (!lastUpdated) {
    return new Date().toISOString();
  }
  if (lastUpdated instanceof Date) {
    return lastUpdated.toISOString();
  }
  return String(lastUpdated);
}

const categoryOrder = [
  'Archestra Platform',
  'Archestra Desktop Agent',
  'Development',
  'Getting Started',
  'API Reference',
  'Guides',
  'Examples',
  'Advanced',
  'Reference',
];

export function getAllDocs(): DocPage[] {
  const docsDirectory = getDocsDirectory();
  if (!docsDirectory || !fs.existsSync(docsDirectory)) {
    return [];
  }

  try {
    const fileNames = fs.readdirSync(docsDirectory);
    const allDocsData = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(docsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        const frontMatter = data as DocFrontMatter;
        const stats = readingTime(content);

        return {
          slug,
          title: frontMatter.title || slug,
          category: frontMatter.category || 'General',
          subcategory: frontMatter.subcategory,
          order: frontMatter.order || 999,
          description: frontMatter.description,
          content,
          readingTime: stats.text,
          lastUpdated: normalizeLastUpdated(frontMatter.lastUpdated),
        } as DocPage;
      });

    return allDocsData.sort(compareDocPages);
  } catch (error) {
    console.error('Error reading documentation:', error);
    return [];
  }
}

export function getDocBySlug(slug: string): DocPage | undefined {
  const docsDirectory = getDocsDirectory();
  if (!docsDirectory) {
    return undefined;
  }

  const fullPath = path.join(docsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return undefined;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const frontMatter = data as DocFrontMatter;
  const stats = readingTime(content);

  const doc: DocPage = {
    slug,
    title: frontMatter.title || slug,
    category: frontMatter.category || 'General',
    subcategory: frontMatter.subcategory,
    order: frontMatter.order || 999,
    description: frontMatter.description,
    content,
    readingTime: stats.text,
    lastUpdated: normalizeLastUpdated(frontMatter.lastUpdated),
  };

  // Add navigation
  const navigation = getNavigationLinks(slug);
  if (navigation) {
    doc.navigation = navigation;
  }

  return doc;
}

export function getDocsByCategory(): DocCategory[] {
  const allDocs = getAllDocs();
  const categoryMap = new Map<string, DocPage[]>();

  allDocs.forEach((doc) => {
    if (!categoryMap.has(doc.category)) {
      categoryMap.set(doc.category, []);
    }
    categoryMap.get(doc.category)!.push(doc);
  });

  const categories: DocCategory[] = Array.from(categoryMap.entries())
    .map(([name, categoryDocs]) => {
      // Group docs by subcategory
      const subcategoryMap = new Map<string | undefined, DocPage[]>();
      const directDocs: DocPage[] = [];

      categoryDocs.forEach((doc) => {
        if (doc.subcategory) {
          if (!subcategoryMap.has(doc.subcategory)) {
            subcategoryMap.set(doc.subcategory, []);
          }
          subcategoryMap.get(doc.subcategory)!.push(doc);
        } else {
          directDocs.push(doc);
        }
      });

      // Create subcategories array
      const subcategories: DocSubcategory[] = Array.from(subcategoryMap.entries())
        .filter(([key]) => key !== undefined)
        .map(([name, docs]) => ({
          name: name!,
          docs: docs.sort((a, b) => a.order - b.order),
        }));

      return {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        docs: directDocs.sort((a, b) => a.order - b.order),
        subcategories: subcategories.length > 0 ? subcategories : undefined,
        order: getCategoryOrder(name),
      };
    })
    .sort((a, b) => a.order - b.order);

  return categories;
}

export function generateTableOfContents(content: string): TableOfContentsItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: TableOfContentsItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    toc.push({ id, text, level });
  }

  return toc;
}

function getNavigationLinks(currentSlug: string): { prev?: DocNavItem; next?: DocNavItem } | undefined {
  const allDocs = getAllDocs();
  const currentIndex = allDocs.findIndex((doc) => doc.slug === currentSlug);

  if (currentIndex === -1) return undefined;

  const navigation: { prev?: DocNavItem; next?: DocNavItem } = {};

  if (currentIndex > 0) {
    const prevDoc = allDocs[currentIndex - 1];
    navigation.prev = {
      slug: prevDoc.slug,
      title: prevDoc.title,
      category: prevDoc.category,
    };
  }

  if (currentIndex < allDocs.length - 1) {
    const nextDoc = allDocs[currentIndex + 1];
    navigation.next = {
      slug: nextDoc.slug,
      title: nextDoc.title,
      category: nextDoc.category,
    };
  }

  return navigation;
}

function getCategoryOrder(category: string): number {
  const index = categoryOrder.findIndex((cat) => cat.toLowerCase() === category.toLowerCase());
  return index === -1 ? 999 : index;
}

export function compareDocPages(a: DocPage, b: DocPage): number {
  // First, sort by category
  const categoryCompare = getCategoryOrder(a.category) - getCategoryOrder(b.category);
  if (categoryCompare !== 0) return categoryCompare;

  // Then, docs without subcategory come before docs with subcategory
  const aHasSubcat = !!a.subcategory;
  const bHasSubcat = !!b.subcategory;
  if (aHasSubcat !== bHasSubcat) {
    return aHasSubcat ? 1 : -1; // Docs without subcategory come first
  }

  // If both have subcategories, sort by subcategory name first
  if (aHasSubcat && bHasSubcat) {
    const subcatCompare = (a.subcategory || '').localeCompare(b.subcategory || '');
    if (subcatCompare !== 0) return subcatCompare;
  }

  // Finally, sort by order
  return a.order - b.order;
}
