/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Serve WebP for old PNG/JPG paths (Convex DB still references original filenames)
      { source: '/images/books/:name.png', destination: '/images/books/:name.webp' },
      { source: '/images/books/:name.jpg', destination: '/images/books/:name.webp' },
      { source: '/images/portfolio/:name.png', destination: '/images/portfolio/:name.webp' },
      { source: '/images/fb-posts/:name.jpg', destination: '/images/fb-posts/:name.webp' },
      { source: '/images/logo/:name.png', destination: '/images/logo/:name.webp' },
      { source: '/images/:name.png', destination: '/images/:name.webp' },
      { source: '/images/:name.jpg', destination: '/images/:name.webp' },
      { source: '/et-monogram.png', destination: '/et-monogram.webp' },
      { source: '/et-wordmark.png', destination: '/et-wordmark.webp' },
      { source: '/arclight-press-logo.png', destination: '/arclight-press-logo.webp' },
      { source: '/og-image.png', destination: '/og-image.webp' },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.convex.cloud',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // CSP is set per-request in middleware.ts (with nonce for script-src)
        ],
      },
    ];
  },
};

module.exports = nextConfig;
