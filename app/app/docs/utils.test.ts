import type { DocPage } from './types';
import { compareDocPages } from './utils';

describe('compareDocPages', () => {
  it('should sort docs by category order', () => {
    const archestraDoc: DocPage = {
      slug: 'archestra',
      title: 'Archestra',
      category: 'Archestra Platform',
      order: 1,
      content: '',
      readingTime: '1 min',
      lastUpdated: '2024-01-01',
    };
    const gettingStartedDoc: DocPage = {
      slug: 'getting-started',
      title: 'Getting Started',
      category: 'Getting Started',
      order: 1,
      content: '',
      readingTime: '1 min',
      lastUpdated: '2024-01-01',
    };

    expect(compareDocPages(archestraDoc, gettingStartedDoc)).toBeLessThan(0);
  });

  it('should place docs without subcategory before docs with subcategory', () => {
    const docWithoutSubcat: DocPage = {
      slug: 'intro',
      title: 'Intro',
      category: 'Getting Started',
      order: 2,
      content: '',
      readingTime: '1 min',
      lastUpdated: '2024-01-01',
    };
    const docWithSubcat: DocPage = {
      slug: 'auth',
      title: 'Auth',
      category: 'Getting Started',
      subcategory: 'Advanced',
      order: 1,
      content: '',
      readingTime: '1 min',
      lastUpdated: '2024-01-01',
    };

    expect(compareDocPages(docWithoutSubcat, docWithSubcat)).toBeLessThan(0);
  });

  it('should sort alphabetically by subcategory name', () => {
    const authDoc: DocPage = {
      slug: 'auth',
      title: 'Auth',
      category: 'Getting Started',
      subcategory: 'Authentication',
      order: 2,
      content: '',
      readingTime: '1 min',
      lastUpdated: '2024-01-01',
    };
    const configDoc: DocPage = {
      slug: 'config',
      title: 'Config',
      category: 'Getting Started',
      subcategory: 'Configuration',
      order: 1,
      content: '',
      readingTime: '1 min',
      lastUpdated: '2024-01-01',
    };

    expect(compareDocPages(authDoc, configDoc)).toBeLessThan(0);
  });

  it('should sort by order field within same category and subcategory', () => {
    const doc1: DocPage = {
      slug: 'doc1',
      title: 'Doc 1',
      category: 'Getting Started',
      order: 1,
      content: '',
      readingTime: '1 min',
      lastUpdated: '2024-01-01',
    };
    const doc2: DocPage = {
      slug: 'doc2',
      title: 'Doc 2',
      category: 'Getting Started',
      order: 2,
      content: '',
      readingTime: '1 min',
      lastUpdated: '2024-01-01',
    };

    expect(compareDocPages(doc1, doc2)).toBeLessThan(0);
  });
});
