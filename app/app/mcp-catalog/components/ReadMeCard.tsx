import 'highlight.js/styles/github.css';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

interface ReadMeCardProps {
  server: ArchestraMcpServerManifest;
}

const ReadMeCard = ({ server: { readme } }: ReadMeCardProps) => {
  if (!readme) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>README.md</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="github-markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="text-2xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b border-gray-200"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-xl font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b border-gray-200"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3" {...props} />,
              h4: ({ node, ...props }) => <h4 className="text-base font-semibold text-gray-900 mt-4 mb-2" {...props} />,
              p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
              a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
              code: ({ node, ...props }) => (
                <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
              ),
              pre: ({ node, ...props }) => (
                <pre className="bg-gray-50 border rounded-lg p-4 overflow-x-auto text-sm mb-4" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-gray-300 pl-4 text-gray-600 italic my-4" {...props} />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-6">
                  <table className="w-full border-collapse border border-gray-300 text-sm" {...props} />
                </div>
              ),
              tr: ({ node, ...props }) => {
                // Filter out valign prop to avoid React warning
                const { valign, vAlign, ...cleanProps } = props as any;
                return <tr {...cleanProps} />;
              },
              th: ({ node, ...props }) => (
                <th className="bg-gray-50 font-semibold text-left px-3 py-2 border border-gray-300" {...props} />
              ),
              td: ({ node, ...props }) => <td className="px-3 py-2 border border-gray-300 align-top" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
              li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
              img: ({ node, ...props }) => <img className="max-w-full h-auto rounded-lg shadow-sm my-4" {...props} />,
              hr: ({ node, ...props }) => <hr className="border-gray-300 my-8" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
            }}
          >
            {readme}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadMeCard;
