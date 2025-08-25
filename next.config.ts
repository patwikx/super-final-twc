import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uwo3lp7kc6.ufs.sh', // The hostname from your error message
        port: '',
        pathname: '/**',
      },
          {
        protocol: 'https',
        hostname: '4b9moeer4y.ufs.sh', // The hostname from your error message
        port: '',
        pathname: '/**',
      },
      // You can add other domains here as well
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;