import 'highlight.js/styles/github.css';
import { Github } from 'lucide-react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

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

            <div className="max-w-3xl mx-auto text-left">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  p: ({ node, ...props }) => <p {...props} className="text-lg text-gray-700 leading-relaxed mb-6" />,
                  h1: ({ node, ...props }) => (
                    <h1 {...props} className="text-3xl font-medium text-gray-900 mb-6 mt-10" />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 {...props} className="text-2xl font-medium text-gray-900 mb-4 mt-8" />
                  ),
                  h3: ({ node, ...props }) => <h3 {...props} className="text-xl font-medium text-gray-900 mb-3 mt-6" />,
                  ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside mb-6 space-y-2 pl-4" />,
                  ol: ({ node, ...props }) => (
                    <ol {...props} className="list-decimal list-inside mb-6 space-y-2 pl-4" />
                  ),
                  li: ({ node, ...props }) => <li {...props} className="text-lg text-gray-700 leading-relaxed" />,
                  a: ({ node, ...props }) => (
                    <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
                  ),
                  img: ({ node, ...props }) => <img {...props} className="rounded-lg shadow-md my-8 w-full" />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      {...props}
                      className="border-l-4 border-gray-300 pl-6 my-6 text-lg text-gray-600 italic"
                    />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre {...props} className="bg-gray-50 rounded-lg p-4 overflow-x-auto my-6 text-sm" />
                  ),
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-200">
              <div className="text-left">
                <p className="text-gray-600 text-sm">Written by</p>
                <p className="text-gray-900 font-medium">{post.author}</p>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
