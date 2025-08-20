import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import readingTime from 'reading-time';

import { BlogPost } from './types';

const postsDirectory = path.join(process.cwd(), 'app/blog/content');

export function getAllPosts(): BlogPost[] {
  // Check if the posts directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  try {
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        const stats = readingTime(content);

        return {
          slug,
          title: data.title || slug,
          date: data.date || new Date().toISOString(),
          author: data.author || 'Archestra Team',
          excerpt: data.description || data.excerpt || content.slice(0, 200) + '...',
          content,
          readingTime: stats.text,
          image: data.image,
          github: data.github,
          cta: data.cta,
        } as BlogPost;
      });

    return allPostsData.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Sort in descending order (newest first)
    });
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return undefined;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    author: data.author || 'Archestra Team',
    excerpt: data.description || data.excerpt || content.slice(0, 200) + '...',
    content,
    readingTime: stats.text,
    image: data.image,
    github: data.github,
    cta: data.cta,
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
