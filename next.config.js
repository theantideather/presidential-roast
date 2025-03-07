/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
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
  // Required for Netlify static deployment
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