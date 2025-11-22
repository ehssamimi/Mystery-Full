/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // PWA Configuration
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json; charset=utf-8',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

