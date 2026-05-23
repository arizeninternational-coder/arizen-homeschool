/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  // Vercel optimization
  experimental: {
    // Enable if using server components
  },
  // Ensure Prisma works on Vercel
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('_http_common');
    }
    return config;
  },
};

module.exports = nextConfig;
