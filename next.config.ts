import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pino', 'pino-pretty']
  }
  /* config options here */
};

export default nextConfig;
