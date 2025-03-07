/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
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
  // Netlify specific settings
  output: 'export',
  distDir: '.next',
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Remove any deprecated or invalid options
  reactStrictMode: true,
  // Netlify requires this to be true for static export
  trailingSlash: true,
};

module.exports = nextConfig; 