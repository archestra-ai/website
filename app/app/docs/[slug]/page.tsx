import 'highlight.js/styles/github.css';
import { ChevronLeft, ChevronRight, Clock, Edit } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Footer from '@components/Footer';
import Header from '@components/Header';
import constants from '@constants';

import DocContent from '../components/DocContent';
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
                  <DocContent content={doc.content} />

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
