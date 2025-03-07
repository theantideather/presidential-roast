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
  // Netlify specific settings
  output: 'export',
  distDir: '.next',
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Remove any deprecated or invalid options
  reactStrictMode: true,
};

module.exports = nextConfig; 