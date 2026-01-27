/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <--- THIS LINE CREATES THE "OUT" FOLDER
  images: {
    unoptimized: true,
  },
};

export default nextConfig;