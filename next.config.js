/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/entradas-contables/:path*',
        destination: 'http://3.80.223.142:3001/api/public/entradas-contables/:path*',
      },
    ];
  },
};

module.exports = nextConfig;