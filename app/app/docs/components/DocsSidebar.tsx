'use client';

import { Book, Code, FileText, Layers, Menu, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { DocCategory } from '../types';

interface DocsSidebarProps {
  categories: DocCategory[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Getting Started': <Book className="h-4 w-4" />,
  'API Reference': <Code className="h-4 w-4" />,
  Development: <Code className="h-4 w-4" />,
  Guides: <FileText className="h-4 w-4" />,
  Examples: <Layers className="h-4 w-4" />,
  Advanced: <Settings className="h-4 w-4" />,
  Reference: <FileText className="h-4 w-4" />,
};

export default function DocsSidebar({ categories }: DocsSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get the first doc slug for comparison
  const firstDocSlug = categories[0]?.docs[0]?.slug;

  const isActiveDoc = (slug: string) => {
    // If we're on /docs and this is the first doc, mark it as active
    if (pathname === '/docs' && slug === firstDocSlug) {
      return true;
    }
    return pathname === `/docs/${slug}`;
  };

  const isActiveCategory = (category: DocCategory) => {
    // Check direct docs
    const hasActiveDirectDoc = category.docs.some((doc) => isActiveDoc(doc.slug));

    // Check subcategory docs
    const hasActiveSubcategoryDoc = category.subcategories?.some((subcategory) =>
      subcategory.docs.some((doc) => isActiveDoc(doc.slug))
    );

    return hasActiveDirectDoc || hasActiveSubcategoryDoc;
  };

  return (
    <>
      {/* Mobile Menu Panel - Only visible on small screens */}
      <div className="block lg:hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="text-sm font-medium text-gray-700">Documentation Menu</span>
            {isMobileMenuOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
          </button>

          {/* Mobile Dropdown Menu */}
          <div
            className={`
            ${isMobileMenuOpen ? 'block' : 'hidden'}
            bg-white border-t border-gray-100 max-h-[60vh] overflow-y-auto
          `}
          >
            <nav className="py-2">
              {/* Mobile Categories */}
              {categories.map((category) => {
                const isActive = isActiveCategory(category);

                return (
                  <div key={category.slug} className="">
                    <div
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                        isActive ? 'text-gray-900 bg-gray-50' : 'text-gray-700'
                      }`}
                    >
                      {categoryIcons[category.name] || <FileText className="h-4 w-4" />}
                      <span>{category.name}</span>
                    </div>

                    <div className="">
                      {/* Direct docs */}
                      {category.docs.map((doc) => {
                        const isDocActive = isActiveDoc(doc.slug);

                        return (
                          <Link
                            key={doc.slug}
                            href={`/docs/${doc.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block pl-10 pr-4 py-2 text-sm transition-colors ${
                              isDocActive
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {doc.title}
                          </Link>
                        );
                      })}

                      {/* Subcategories */}
                      {category.subcategories?.map((subcategory) => (
                        <div key={subcategory.name} className="mt-4">
                          <div className="pl-10 pr-4 py-1 flex items-center gap-2">
                            <span className="text-gray-400">——</span>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                              {subcategory.name}
                            </span>
                            <span className="text-gray-400">——</span>
                          </div>
                          {subcategory.docs.map((doc) => {
                            const isDocActive = isActiveDoc(doc.slug);

                            return (
                              <Link
                                key={doc.slug}
                                href={`/docs/${doc.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block pl-10 pr-4 py-2 text-sm transition-colors ${
                                  isDocActive
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                {doc.title}
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Only visible on large screens */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <nav className="space-y-4 pb-8">
            {/* Desktop Categories */}
            {categories.map((category) => {
              const isActive = isActiveCategory(category);

              return (
                <div key={category.slug} className="space-y-1">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                      isActive ? 'text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {categoryIcons[category.name] || <FileText className="h-4 w-4" />}
                    <span>{category.name}</span>
                  </div>

                  <div className="ml-6 space-y-1">
                    {/* Direct docs */}
                    {category.docs.map((doc) => {
                      const isDocActive = isActiveDoc(doc.slug);

                      return (
                        <Link
                          key={doc.slug}
                          href={`/docs/${doc.slug}`}
                          className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                            isDocActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {doc.title}
                        </Link>
                      );
                    })}

                    {/* Subcategories */}
                    {category.subcategories?.map((subcategory) => (
                      <div key={subcategory.name} className="mt-4">
                        <div className="px-3 py-1 flex items-center gap-2">
                          <span className="text-gray-400 text-xs">——</span>
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            {subcategory.name}
                          </span>
                          <span className="text-gray-400 text-xs">——</span>
                        </div>
                        <div className="space-y-1">
                          {subcategory.docs.map((doc) => {
                            const isDocActive = isActiveDoc(doc.slug);

                            return (
                              <Link
                                key={doc.slug}
                                href={`/docs/${doc.slug}`}
                                className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                                  isDocActive
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                {doc.title}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
