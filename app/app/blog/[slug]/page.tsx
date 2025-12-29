import 'highlight.js/styles/github.css';
import { Github } from 'lucide-react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BlogContent from '@components/BlogContent';
import Footer from '@components/Footer';
import Header from '@components/Header';
import constants from '@constants';

import { formatDateShort, getAllPosts, getPostBySlug } from '../utils';

const {
  company: { name: companyName },
} = constants;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: `Post Not Found | ${companyName}`,
    };
  }

  return {
    title: `${post.title} | ${companyName} Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative flex flex-col">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container relative z-10 px-4 md:px-6 py-16 max-w-4xl mx-auto">
          <article className="text-center">
            <header className="mb-16">
              <div className="text-blue-600 text-base mb-4">{formatDateShort(post.date)}</div>
              <h1 className="text-3xl md:text-4xl font-medium text-gray-900 mb-6 leading-tight max-w-4xl mx-auto">
                {post.title}
              </h1>

              <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">{post.excerpt}</p>

              {post.image && (
                <div className="mb-8 max-w-4xl mx-auto">
                  <img src={post.image} alt={post.title} className="w-full rounded-lg shadow-lg" />
                </div>
              )}

              {(post.github || post.cta) && (
                <div className="flex items-center justify-center gap-4">
                  {post.github && (
                    <a
                      href={post.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Github className="h-5 w-5" />
                      GitHub
                    </a>
                  )}
                  {post.cta && (
                    <a
                      href={post.cta.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      {post.cta.text}
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </header>

            <div className="max-w-3xl mx-auto mb-8 text-left">
              <p className="text-gray-600 text-sm">Written by</p>
              <p className="text-gray-900 font-medium">{post.author}</p>
            </div>

            <div className="max-w-3xl mx-auto text-left">
              <BlogContent content={post.content} />
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
