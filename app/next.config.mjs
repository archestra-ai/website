/** @type {import('next').NextConfig} */
const nextConfig = {
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
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
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
        source: '/docs/:path*.webp',
        destination: '/api/docs-images/:path*.webp',
      },
      {
        source: '/docs/:path*.svg',
        destination: '/api/docs-images/:path*.svg',
      },
    ];
  },
  async redirects() {
    return [
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
