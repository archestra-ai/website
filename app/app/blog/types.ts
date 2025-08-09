export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  readingTime: string;
  image?: string;
  github?: string;
  cta?: {
    text: string;
    url: string;
  };
}
