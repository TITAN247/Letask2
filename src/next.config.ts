import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable Turbopack to fix custom server compatibility
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
