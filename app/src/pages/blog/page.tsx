import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import Footer from '@components/Footer';
import Header from '@components/Header';
import { formatDate, getAllPosts } from '@utils/blog';

export const metadata: Metadata = {
  title: 'Blog | Archestra',
  description:
    'Latest news, updates, and insights from the Archestra team about MCP, AI agents, and enterprise platforms.',
};

export default function BlogPage() {
  const posts = getAllPosts();

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

        <div className="container relative z-10 px-4 md:px-6 py-16 max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Blog</h1>
            <p className="text-xl text-gray-700">Latest news, updates, and insights from the Archestra team</p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
                    <div className="aspect-video relative overflow-hidden bg-gray-100">
                      {post.image ? (
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-4xl font-bold opacity-20">Archestra</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime}
                        </span>
                      </div>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>

                      <div className="mt-auto">
                        <span className="inline-flex items-center gap-1 text-blue-600 font-medium text-sm hover:gap-2 transition-all">
                          Read more
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
