import { slug } from 'github-slugger';

import type { DocPage } from './types';
import { buildDocMetadata, compareDocPages, generateTableOfContents } from './utils';

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

describe('buildDocMetadata', () => {
  const origin = 'https://example.com';
  const companyName = 'TestCompany';

  const mockDoc: DocPage = {
    slug: 'test-doc',
    title: 'Test Document',
    category: 'Getting Started',
    description: 'A test document description',
    order: 1,
    content: '# Test content',
    readingTime: '2 min',
    lastUpdated: '2024-06-15T00:00:00.000Z',
  };

  it('should return not found metadata when doc is undefined', () => {
    const metadata = buildDocMetadata(undefined, origin, companyName);

    expect(metadata.title).toBe(`Documentation Not Found | ${companyName}`);
    expect(metadata.description).toBe(`${companyName} documentation page not found.`);
    expect(metadata.openGraph?.title).toBe(`Documentation Not Found | ${companyName}`);
  });

  it('should include OpenGraph metadata with correct image URL', () => {
    const metadata = buildDocMetadata(mockDoc, origin, companyName);

    expect(metadata.openGraph).toBeDefined();
    const og = metadata.openGraph as Record<string, unknown>;
    expect(og.title).toBe(mockDoc.title);
    expect(og.description).toBe(mockDoc.description);
    expect(og.type).toBe('article');
    expect(og.url).toBe(`${origin}/docs/${mockDoc.slug}`);

    const images = og.images as Array<{ url: string; width: number; height: number; alt: string }>;
    expect(images).toHaveLength(1);
    expect(images[0].url).toBe(`${origin}/docs/${mockDoc.slug}/opengraph-image`);
    expect(images[0].width).toBe(1200);
    expect(images[0].height).toBe(630);
  });

  it('should include Twitter card metadata with correct image URL', () => {
    const metadata = buildDocMetadata(mockDoc, origin, companyName);

    expect(metadata.twitter).toBeDefined();
    const twitter = metadata.twitter as Record<string, unknown>;
    expect(twitter.card).toBe('summary_large_image');
    expect(twitter.title).toBe(mockDoc.title);
    expect(twitter.description).toBe(mockDoc.description);

    const images = twitter.images as Array<{ url: string; width: number; height: number; alt: string }>;
    expect(images).toHaveLength(1);
    expect(images[0].url).toBe(`${origin}/docs/${mockDoc.slug}/opengraph-image`);
  });

  it('should use default description when doc.description is not provided', () => {
    const docWithoutDescription: DocPage = {
      ...mockDoc,
      description: undefined,
    };
    const metadata = buildDocMetadata(docWithoutDescription, origin, companyName);

    const expectedDescription = `${mockDoc.title} documentation for ${companyName}.`;
    expect(metadata.description).toBe(expectedDescription);
    expect(metadata.openGraph?.description).toBe(expectedDescription);
    expect(metadata.twitter?.description).toBe(expectedDescription);
  });

  it('should set metadataBase to origin URL', () => {
    const metadata = buildDocMetadata(mockDoc, origin, companyName);

    expect(metadata.metadataBase).toEqual(new URL(origin));
  });

  it('should include publishedTime in OpenGraph metadata', () => {
    const metadata = buildDocMetadata(mockDoc, origin, companyName);

    const og = metadata.openGraph as Record<string, unknown>;
    expect(og.publishedTime).toBe(mockDoc.lastUpdated);
  });
});

describe('generateTableOfContents', () => {
  it('should extract h2 and h3 headings', () => {
    const content = `
## First Section
Some text
### Subsection
More text
## Second Section
`;
    const toc = generateTableOfContents(content);
    expect(toc).toEqual([
      { id: 'first-section', text: 'First Section', level: 2 },
      { id: 'subsection', text: 'Subsection', level: 3 },
      { id: 'second-section', text: 'Second Section', level: 2 },
    ]);
  });

  it('should ignore h1 and h4+ headings', () => {
    const content = `
# Title
## Included
### Also Included
#### Not Included
##### Not Included Either
`;
    const toc = generateTableOfContents(content);
    expect(toc).toHaveLength(2);
    expect(toc[0]).toEqual({ id: 'included', text: 'Included', level: 2 });
    expect(toc[1]).toEqual({ id: 'also-included', text: 'Also Included', level: 3 });
  });

  it('should generate IDs matching github-slugger used by rehype-slug', () => {
    const headings = [
      'Application & API Configuration',
      'Authentication & Security',
      'Observability & Metrics',
      'Incoming Email Configuration',
      'LLM Provider Configuration',
      'ChatOps Configuration',
    ];

    const content = headings.map((h) => `## ${h}\nSome text`).join('\n');
    const toc = generateTableOfContents(content);

    headings.forEach((heading, i) => {
      expect(toc[i].id).toBe(slug(heading));
    });
  });

  it('should preserve double hyphens when special characters like & are stripped', () => {
    const content = '## Application & API Configuration';
    const toc = generateTableOfContents(content);
    expect(toc[0].id).toBe('application--api-configuration');
  });

  it('should handle duplicate headings by appending numeric suffixes', () => {
    const content = `
## Setup
Some text
## Setup
More text
## Setup
Even more
`;
    const toc = generateTableOfContents(content);
    expect(toc).toEqual([
      { id: 'setup', text: 'Setup', level: 2 },
      { id: 'setup-1', text: 'Setup', level: 2 },
      { id: 'setup-2', text: 'Setup', level: 2 },
    ]);
  });

  it('should return empty array for content with no headings', () => {
    expect(generateTableOfContents('Just some plain text.')).toEqual([]);
  });

  it('should not match headings inside inline code', () => {
    const content = `
## Real Heading
\`\`\`
Not a heading in code block
\`\`\`
`;
    const toc = generateTableOfContents(content);
    expect(toc).toHaveLength(1);
    expect(toc[0].text).toBe('Real Heading');
  });
});
