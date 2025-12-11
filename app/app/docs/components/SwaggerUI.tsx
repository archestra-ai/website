'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import swagger-ui-react to avoid SSR issues
const SwaggerUIReact = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-pulse text-gray-500">Loading API documentation...</div>
    </div>
  ),
});

interface SwaggerUIProps {
  specUrl?: string;
}

export default function SwaggerUI({ specUrl = '/docs/openapi.json' }: SwaggerUIProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-500">Loading API documentation...</div>
      </div>
    );
  }

  return (
    <div className="swagger-ui-wrapper">
      <style jsx global>{`
        /* Custom styles to integrate Swagger UI with the docs theme */
        .swagger-ui-wrapper .swagger-ui {
          font-family: inherit;
        }

        .swagger-ui-wrapper .swagger-ui .info {
          margin: 20px 0;
        }

        .swagger-ui-wrapper .swagger-ui .info .title {
          font-size: 2rem;
          color: #111827;
        }

        .swagger-ui-wrapper .swagger-ui .info .description {
          font-size: 1rem;
          color: #4b5563;
        }

        .swagger-ui-wrapper .swagger-ui .opblock-tag {
          font-size: 1.25rem;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }

        .swagger-ui-wrapper .swagger-ui .opblock {
          border-radius: 8px;
          box-shadow: none;
          border: 1px solid #e5e7eb;
          margin-bottom: 12px;
        }

        .swagger-ui-wrapper .swagger-ui .opblock .opblock-summary {
          border-radius: 8px;
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-get {
          border-color: #93c5fd;
          background: rgba(59, 130, 246, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-post {
          border-color: #86efac;
          background: rgba(34, 197, 94, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-put {
          border-color: #fcd34d;
          background: rgba(234, 179, 8, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-patch {
          border-color: #c4b5fd;
          background: rgba(139, 92, 246, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .opblock.opblock-delete {
          border-color: #fca5a5;
          background: rgba(239, 68, 68, 0.05);
        }

        .swagger-ui-wrapper .swagger-ui .btn {
          border-radius: 6px;
        }

        .swagger-ui-wrapper .swagger-ui select {
          border-radius: 6px;
        }

        .swagger-ui-wrapper .swagger-ui input[type='text'],
        .swagger-ui-wrapper .swagger-ui textarea {
          border-radius: 6px;
        }

        .swagger-ui-wrapper .swagger-ui .model-box {
          border-radius: 8px;
        }

        .swagger-ui-wrapper .swagger-ui table tbody tr td {
          padding: 12px;
        }

        /* Hide the info/description section since we have our own */
        .swagger-ui-wrapper .swagger-ui .info {
          display: none;
        }
      `}</style>
      <SwaggerUIReact url={specUrl} defaultModelsExpandDepth={-1} supportedSubmitMethods={[]} tryItOutEnabled={false} />
    </div>
  );
}
