import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['frayed-subpar-circus.ngrok-free.dev'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:5211'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
