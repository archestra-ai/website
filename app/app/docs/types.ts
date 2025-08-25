export interface DocPage {
  slug: string;
  title: string;
  category: string;
  order: number;
  description?: string;
  content: string;
  readingTime: string;
  lastUpdated: string;
  navigation?: {
    prev?: DocNavItem;
    next?: DocNavItem;
  };
}

export interface DocNavItem {
  slug: string;
  title: string;
  category: string;
}

export interface DocCategory {
  name: string;
  slug: string;
  description?: string;
  order: number;
  docs: DocPage[];
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

export interface DocFrontMatter {
  title: string;
  category: string;
  order?: number;
  description?: string;
  lastUpdated?: string;
}