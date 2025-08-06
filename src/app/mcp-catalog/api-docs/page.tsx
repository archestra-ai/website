'use client';

import { useEffect } from 'react';

export default function ApiDocsPage() {
  useEffect(() => {
    // Dynamically load Swagger UI
    const loadSwaggerUI = async () => {
      // Add Swagger UI CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css';
      document.head.appendChild(link);

      // Load Swagger UI bundle
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js';
      script.onload = () => {
        // Initialize Swagger UI after script loads
        if ((window as any).SwaggerUIBundle) {
          const ui = (window as any).SwaggerUIBundle({
            url: '/mcp-catalog/api/docs',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [(window as any).SwaggerUIBundle.presets.apis],
            layout: 'BaseLayout',
          });

          // Make it available globally for debugging
          (window as any).ui = ui;
        }
      };
      document.body.appendChild(script);
    };

    loadSwaggerUI();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">MCP Catalog API Documentation</h1>
          <p className="text-gray-600">
            Interactive API documentation for the MCP Catalog. Test endpoints directly from this page.
          </p>
        </div>
        <div id="swagger-ui" />
      </div>
    </div>
  );
}
