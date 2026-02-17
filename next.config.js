/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Removed experimental.serverActions as per Next.js 14 update
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
};

module.exports = nextConfig;
