import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import readingTime from 'reading-time';

import { DocCategory, DocFrontMatter, DocNavItem, DocPage, TableOfContentsItem } from './types';

const docsDirectory = path.join(process.cwd(), 'app/docs/content');

const categoryOrder = ['Getting Started', 'API Reference', 'Guides', 'Examples', 'Advanced', 'Reference'];

export function getAllDocs(): DocPage[] {
  if (!fs.existsSync(docsDirectory)) {
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
          order: frontMatter.order || 999,
          description: frontMatter.description,
          content,
          readingTime: stats.text,
          lastUpdated: frontMatter.lastUpdated || new Date().toISOString(),
        } as DocPage;
      });

    return allDocsData.sort((a, b) => {
      const categoryCompare = getCategoryOrder(a.category) - getCategoryOrder(b.category);
      if (categoryCompare !== 0) return categoryCompare;
      return a.order - b.order;
    });
  } catch (error) {
    console.error('Error reading documentation:', error);
    return [];
  }
}

export function getDocBySlug(slug: string): DocPage | undefined {
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
    order: frontMatter.order || 999,
    description: frontMatter.description,
    content,
    readingTime: stats.text,
    lastUpdated: frontMatter.lastUpdated || new Date().toISOString(),
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
    .map(([name, docs]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      docs: docs.sort((a, b) => a.order - b.order),
      order: getCategoryOrder(name),
    }))
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

export function getNavigationLinks(currentSlug: string): { prev?: DocNavItem; next?: DocNavItem } | undefined {
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

export function formatLastUpdated(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function searchDocs(query: string): DocPage[] {
  const allDocs = getAllDocs();
  const searchTerms = query.toLowerCase().split(' ').filter(Boolean);

  if (searchTerms.length === 0) return allDocs;

  return allDocs
    .map((doc) => {
      const titleMatch = searchTerms.filter((term) => doc.title.toLowerCase().includes(term)).length;
      const contentMatch = searchTerms.filter((term) => doc.content.toLowerCase().includes(term)).length;
      const descriptionMatch = doc.description
        ? searchTerms.filter((term) => doc.description!.toLowerCase().includes(term)).length
        : 0;

      const score = titleMatch * 10 + descriptionMatch * 5 + contentMatch;

      return { doc, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ doc }) => doc);
}
