/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // <--- This line fixes the error!
  eslint: {
    ignoreDuringBuilds: true,
  },
};

 module.exports = nextConfig;