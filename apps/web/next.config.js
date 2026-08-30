/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@plate/api', '@plate/database', '@plate/skill-packs'],
  experimental: {
    externalDir: true,
  },
  async rewrites() {
    const api = process.env.PLATE_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/plate/:path*',
        destination: `${api}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
