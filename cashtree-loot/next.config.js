/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This allows you to build even if there are small linting warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;