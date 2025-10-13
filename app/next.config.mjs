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
  async redirects() {
    return [
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
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
