/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['media.giphy.com', 'unavatar.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.giphy.com',
      },
      {
        protocol: 'https',
        hostname: 'unavatar.io',
      }
    ],
  },
  // Required for Netlify deployment
  trailingSlash: true,
  reactStrictMode: true,
  // Disable type checking during build (we'll rely on local linting)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 