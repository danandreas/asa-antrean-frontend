import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://43.218.118.117/laravel13/public/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
