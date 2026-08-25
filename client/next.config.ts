import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['frayed-subpar-circus.ngrok-free.dev'],
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://127.0.0.1:5211'}/api/:path*`,
      },
      {
        source: '/hub/:path*',
        destination: `${process.env.BACKEND_URL || 'http://127.0.0.1:5211'}/hub/:path*`,
      },
    ];
  },
};

export default nextConfig;
