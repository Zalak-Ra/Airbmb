import type { NextConfig } from 'next';

/**
 * Image remotePatterns are allowlists, not CDNs.
 * Why: next/image will refuse unknown hosts, which prevents accidental
 * hotlinking and keeps the optimizer's work bounded to Unsplash.
 *
 * `output: 'standalone'` emits a self-contained Node server under
 * `.next/standalone`. That is what the production Dockerfile copies —
 * Vercel ignores this flag and builds from source.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
