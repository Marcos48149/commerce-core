import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@commerce/api-client', '@commerce/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
