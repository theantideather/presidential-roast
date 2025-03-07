/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.giphy.com',
        pathname: '/**',
      },
    ],
  },
  // Add Netlify specific configuration
  target: 'serverless',
};

module.exports = nextConfig; 