'use client';

import { Check, Copy, Link as LinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import { Button } from '@components/ui/button';

interface DocContentProps {
  content: string;
}

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const extractText = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node && typeof node === 'object' && 'props' in node) {
      return extractText((node as any).props.children);
    }
    return '';
  };

  const copyToClipboard = async () => {
    try {
      const text = extractText(children);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative group my-6">
      <div className="overflow-x-auto rounded-lg bg-gray-50">
        <pre className={className || 'p-4 text-sm whitespace-pre'}>{children}</pre>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 h-7 w-7 p-0 bg-white hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
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
              <h2
                {...props}
                className="text-2xl font-bold text-gray-900 mb-4 mt-8 group relative scroll-mt-20 transition-colors"
              >
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
              <h3
                {...props}
                className="text-xl font-bold text-gray-900 mb-3 mt-6 group relative scroll-mt-20 transition-colors"
              >
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
          ul: ({ node, ...props }) => <ul {...props} className="list-disc list-outside mb-4 space-y-2 ml-6" />,
          ol: ({ node, ...props }) => <ol {...props} className="list-decimal list-outside mb-4 space-y-2 ml-6" />,
          li: ({ node, ...props }) => <li {...props} className="text-gray-700 leading-relaxed" />,
          a: ({ node, href, ...props }) => {
            // Check if it's an external link
            const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
            // Check if external link is to the same domain
            const isSameDomain =
              isExternal && typeof window !== 'undefined' && new URL(href).hostname === window.location.hostname;
            // Internal links (starting with /) or same domain links don't open in new tab
            const shouldOpenInNewTab = isExternal && !isSameDomain;

            return (
              <a
                {...props}
                href={href}
                className="text-blue-600 hover:underline"
                target={shouldOpenInNewTab ? '_blank' : undefined}
                rel={shouldOpenInNewTab ? 'noopener noreferrer' : undefined}
              />
            );
          },
          img: ({ node, ...props }) => (
            <img {...props} className="rounded-lg shadow-md my-6 w-full max-w-2xl mx-auto" />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote {...props} className="border-l-4 border-blue-500 pl-4 my-4 text-gray-600 italic" />
          ),
          pre: ({ node, children, ...props }) => <CodeBlock {...props}>{children}</CodeBlock>,
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            // Code inside a pre block (code fence)
            return match ? (
              <code {...props}>{children}</code>
            ) : (
              // Inline code
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono break-all" {...props}>
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
            <th {...props} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
          ),
          td: ({ node, ...props }) => <td {...props} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" />,
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
