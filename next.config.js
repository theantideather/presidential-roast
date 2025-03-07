/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.giphy.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unavatar.io',
        pathname: '/**',
      }
    ],
  },
  // Remove deprecated target configuration
  output: 'standalone', // Optimized for Netlify deployment
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig; 