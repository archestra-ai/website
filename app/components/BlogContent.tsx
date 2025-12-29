'use client';

import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

const MermaidDiagram = dynamic(() => import('@components/MermaidDiagram'), {
  ssr: false,
  loading: () => <div className="text-center py-8">Loading diagram...</div>,
});

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeHighlight, rehypeRaw]}
      components={{
        p: ({ node, ...props }) => <p {...props} className="text-lg text-gray-700 leading-relaxed mb-6" />,
        h1: ({ node, ...props }) => <h1 {...props} className="text-3xl font-medium text-gray-900 mb-6 mt-10" />,
        h2: ({ node, ...props }) => <h2 {...props} className="text-2xl font-medium text-gray-900 mb-4 mt-8" />,
        h3: ({ node, ...props }) => <h3 {...props} className="text-xl font-medium text-gray-900 mb-3 mt-6" />,
        ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside mb-6 space-y-2 pl-4" />,
        ol: ({ node, ...props }) => <ol {...props} className="list-decimal list-inside mb-6 space-y-2 pl-4" />,
        li: ({ node, ...props }) => <li {...props} className="text-lg text-gray-700 leading-relaxed" />,
        a: ({ node, href, ...props }) => {
          const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
          const isSameDomain =
            isExternal && typeof window !== 'undefined' && new URL(href).hostname === window.location.hostname;
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
        img: ({ node, alt, ...props }) => (
          <figure className="my-8">
            <img {...props} alt={alt} className="rounded-lg shadow-md w-full" />
            {alt && <figcaption className="text-center text-gray-600 italic mt-2 text-sm">{alt}</figcaption>}
          </figure>
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote {...props} className="border-l-4 border-gray-300 pl-6 my-6 text-lg text-gray-600 italic" />
        ),
        pre: ({ node, children, ...props }) => {
          // Check if this is a mermaid code block
          if (node && node.children && node.children.length > 0) {
            const codeElement = node.children[0] as any;
            if (codeElement?.properties?.className?.includes('language-mermaid')) {
              const mermaidCode = (codeElement.children[0] as any)?.value || '';
              return <MermaidDiagram chart={mermaidCode} />;
            }
          }
          return (
            <pre {...props} className="bg-gray-50 rounded-lg p-4 overflow-x-auto my-6 text-sm">
              {children}
            </pre>
          );
        },
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          // Don't render mermaid code blocks as code (they'll be handled by pre)
          if (match && match[1] === 'mermaid') {
            return null;
          }
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
      {content}
    </ReactMarkdown>
  );
}
