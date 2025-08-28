'use client';

import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { Link as LinkIcon } from 'lucide-react';

interface DocContentProps {
  content: string;
}

export default function DocContent({ content }: DocContentProps) {
  useEffect(() => {
    // Handle initial load with hash
    if (window.location.hash) {
      setTimeout(() => {
        const id = window.location.hash.slice(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Add highlight effect
          element.classList.add('bg-yellow-100', 'transition-all', 'duration-300');
          setTimeout(() => {
            element.classList.remove('bg-yellow-100');
          }, 2000);
        }
      }, 100);
    }

    // Handle hash changes
    const handleHashChange = () => {
      const id = window.location.hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Add highlight effect  
        element.classList.add('bg-yellow-100', 'transition-all', 'duration-300');
        setTimeout(() => {
          element.classList.remove('bg-yellow-100');
        }, 2000);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Update URL
      window.history.pushState(null, '', `#${id}`);
      // Scroll to element
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Copy link to clipboard
      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${id}`);
      // Show feedback (could add a toast here)
      element.classList.add('bg-yellow-100', 'transition-all', 'duration-300');
      setTimeout(() => {
        element.classList.remove('bg-yellow-100');
      }, 2000);
    }
  };

  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeSlug]}
        components={{
          p: ({ node, ...props }) => <p {...props} className="text-gray-700 leading-relaxed mb-4" />,
          h1: ({ node, children, ...props }) => {
            const id = props.id || '';
            return (
              <h1 {...props} className="text-3xl font-bold text-gray-900 mb-6 mt-10 group relative transition-colors">
                <a
                  href={`#${id}`}
                  className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleAnchorClick(e, id)}
                  title="Copy link to section"
                >
                  <LinkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </a>
                {children}
              </h1>
            );
          },
          h2: ({ node, children, ...props }) => {
            const id = props.id || '';
            return (
              <h2 {...props} className="text-2xl font-bold text-gray-900 mb-4 mt-8 group relative scroll-mt-20 transition-colors">
                <a
                  href={`#${id}`}
                  className="absolute -left-8 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleAnchorClick(e, id)}
                  title="Copy link to section"
                >
                  <LinkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </a>
                {children}
              </h2>
            );
          },
          h3: ({ node, children, ...props }) => {
            const id = props.id || '';
            return (
              <h3 {...props} className="text-xl font-bold text-gray-900 mb-3 mt-6 group relative scroll-mt-20 transition-colors">
                <a
                  href={`#${id}`}
                  className="absolute -left-8 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleAnchorClick(e, id)}
                  title="Copy link to section"
                >
                  <LinkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </a>
                {children}
              </h3>
            );
          },
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
          img: ({ node, ...props }) => <img {...props} className="rounded-lg shadow-md my-6 w-full max-w-2xl mx-auto" />,
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
        {content}
      </ReactMarkdown>
    </div>
  );
}