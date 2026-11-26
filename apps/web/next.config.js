/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@plate/api', '@plate/database', '@plate/skill-packs', 'ogl'],
  experimental: {
    externalDir: true,
  },
  async rewrites() {
    // Production does not proxy to localhost. Set PLATE_API_URL only when the
    // public site should forward /api/plate/* to a backend you intend to expose.
    const api =
      process.env.PLATE_API_URL ||
      (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '');
    if (!api) return [];
    return [
      {
        source: '/api/plate/:path*',
        destination: `${api}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
