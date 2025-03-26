/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['geist'], // For Geist font compatibility
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '/**',
      }
    ],
  },
};

module.exports = nextConfig;