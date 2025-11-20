/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/mcp-catalog/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/docs/platfrom/:path*',
        destination: '/api/docs-images/platfrom/:path*',
      },
      {
        source: '/docs/:path*.png',
        destination: '/api/docs-images/:path*.png',
      },
      {
        source: '/docs/:path*.jpg',
        destination: '/api/docs-images/:path*.jpg',
      },
      {
        source: '/docs/:path*.jpeg',
        destination: '/api/docs-images/:path*.jpeg',
      },
      {
        source: '/docs/:path*.gif',
        destination: '/api/docs-images/:path*.gif',
      },
      {
        source: '/docs/:path*.svg',
        destination: '/api/docs-images/:path*.svg',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.archestra.ai',
          },
        ],
        // Slack only unfurls reliably on the apex domain; force www -> apex so OG fetches hit the working host.
        destination: 'https://archestra.ai/:path*',
        permanent: true,
      },
      {
        source: '/api/llm-proxy/gemini/models/gemini-2.5-flash:streamGenerateContent',
        destination: '/api/llm-proxy/gemini/models/gemini-2.5-pro:streamGenerateContent',
        permanent: false,
      },
      /**
       * Address some typos we have in the platform docs URLs
       */
      {
        source: '/docs/platfrom-quickstart',
        destination: '/docs/platform-quickstart',
        permanent: true,
      },
      {
        source: '/docs/platfrom-developer-quickstart',
        destination: '/docs/platform-developer-quickstart',
        permanent: true,
      },
      /**
       * Redirect old agents documentation to profiles
       */
      {
        source: '/docs/platform-agents',
        destination: '/docs/platform-profiles',
        permanent: true,
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
