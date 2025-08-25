import 'highlight.js/styles/github.css';
import { ChevronLeft, ChevronRight, Clock, Edit } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import Footer from '@components/Footer';
import Header from '@components/Header';
import constants from '@constants';

import DocsSidebar from '../components/DocsSidebar';
import { TableOfContentsItem } from '../types';
import { formatLastUpdated, generateTableOfContents, getAllDocs, getDocBySlug, getDocsByCategory } from '../utils';

const {
  company: { name: companyName },
} = constants;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    return {
      title: `Documentation Not Found | ${companyName}`,
    };
  }

  return {
    title: `${doc.title} | ${companyName} Docs`,
    openGraph: {
      title: doc.title,
      type: 'article',
      publishedTime: doc.lastUpdated,
    },
  };
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  const categories = getDocsByCategory();
  const toc = doc ? generateTableOfContents(doc.content) : [];

  if (!doc) {
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

        <div className="container relative z-10 px-4 md:px-6 py-8 max-w-7xl mx-auto">
          {/* Mobile Menu - Outside of flex container */}
          <div className="lg:hidden -mx-4 -mt-8 mb-4">
            <DocsSidebar categories={categories} />
          </div>

          <div className="lg:flex gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <DocsSidebar categories={categories} />
            </div>

            {/* Main Content */}
            <article className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <nav className="mb-6 text-sm">
                <ol className="flex items-center space-x-2 text-gray-600">
                  <li>
                    <Link href="/docs" className="hover:text-blue-600 transition-colors">
                      Docs
                    </Link>
                  </li>
                  <li>/</li>
                  <li>
                    <span className="text-gray-500">{doc.category}</span>
                  </li>
                  <li>/</li>
                  <li className="text-gray-900 font-medium">{doc.title}</li>
                </ol>
              </nav>

              <div className="flex gap-8">
                {/* Article Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <header className="mb-8 pb-8 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">{doc.title}</h1>
                      <a
                        href={`https://github.com/archestra-ai/website/edit/main/app/app/docs/content/${doc.slug}.md`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit on GitHub</span>
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {doc.readingTime}
                      </span>
                    </div>
                  </header>

                  {/* Content */}
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeSlug]}
                      components={{
                        p: ({ node, ...props }) => <p {...props} className="text-gray-700 leading-relaxed mb-4" />,
                        h1: ({ node, children, ...props }) => (
                          <h1 {...props} className="text-3xl font-bold text-gray-900 mb-6 mt-10">
                            {children}
                          </h1>
                        ),
                        h2: ({ node, children, ...props }) => (
                          <h2 {...props} className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                            {children}
                          </h2>
                        ),
                        h3: ({ node, children, ...props }) => (
                          <h3 {...props} className="text-xl font-bold text-gray-900 mb-3 mt-6">
                            {children}
                          </h3>
                        ),
                        ul: ({ node, ...props }) => (
                          <ul {...props} className="list-disc list-inside mb-4 space-y-2 pl-4" />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol {...props} className="list-decimal list-inside mb-4 space-y-2 pl-4" />
                        ),
                        li: ({ node, ...props }) => <li {...props} className="text-gray-700 leading-relaxed" />,
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        img: ({ node, ...props }) => <img {...props} className="rounded-lg shadow-md my-6 w-full" />,
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            {...props}
                            className="border-l-4 border-blue-500 pl-4 my-4 text-gray-600 italic"
                          />
                        ),
                        pre: ({ node, children, ...props }) => (
                          <pre {...props} className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm my-6">
                            {children}
                          </pre>
                        ),
                        code: ({ node, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return match ? (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                              {children}
                            </code>
                          );
                        },
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-6">
                            <table {...props} className="min-w-full divide-y divide-gray-200" />
                          </div>
                        ),
                        thead: ({ node, ...props }) => <thead {...props} className="bg-gray-50" />,
                        th: ({ node, ...props }) => (
                          <th
                            {...props}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td {...props} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" />
                        ),
                        // Custom components for callouts
                        div: ({ node, className, children, ...props }) => {
                          if (className?.includes('callout')) {
                            const type = className.split('-')[1] || 'info';
                            const styles = {
                              info: 'bg-blue-50 border-blue-200 text-blue-900',
                              warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
                              danger: 'bg-red-50 border-red-200 text-red-900',
                              success: 'bg-green-50 border-green-200 text-green-900',
                            };

                            return (
                              <div
                                className={`p-4 my-4 border-l-4 rounded-r-lg ${styles[type as keyof typeof styles] || styles.info}`}
                                {...props}
                              >
                                {children}
                              </div>
                            );
                          }

                          return (
                            <div className={className} {...props}>
                              {children}
                            </div>
                          );
                        },
                      }}
                    >
                      {doc.content}
                    </ReactMarkdown>
                  </div>

                  {/* Navigation */}
                  {doc.navigation && (
                    <nav className="mt-12 pt-8 border-t border-gray-200">
                      <div className="flex justify-between">
                        {doc.navigation.prev ? (
                          <Link
                            href={`/docs/${doc.navigation.prev.slug}`}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <ChevronLeft className="h-5 w-5" />
                            <div>
                              <div className="text-xs text-gray-500">Previous</div>
                              <div className="font-medium">{doc.navigation.prev.title}</div>
                            </div>
                          </Link>
                        ) : (
                          <div />
                        )}

                        {doc.navigation.next && (
                          <Link
                            href={`/docs/${doc.navigation.next.slug}`}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-right"
                          >
                            <div>
                              <div className="text-xs text-gray-500">Next</div>
                              <div className="font-medium">{doc.navigation.next.title}</div>
                            </div>
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        )}
                      </div>
                    </nav>
                  )}
                </div>

                {/* Table of Contents - Right Sidebar */}
                {toc.length > 0 && (
                  <aside className="hidden xl:block w-64 flex-shrink-0">
                    <div className="sticky top-20">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                        On this page
                      </h3>
                      <nav className="space-y-1">
                        {toc.map((item) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={`
                              block w-full text-left py-1.5 text-sm transition-colors
                              ${item.level === 2 ? 'pl-0' : 'pl-4'}
                              text-gray-600 hover:text-gray-900 border-l border-transparent
                            `}
                          >
                            {item.text}
                          </a>
                        ))}
                      </nav>
                    </div>
                  </aside>
                )}
              </div>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
