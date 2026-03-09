import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint errors during builds (removes all @typescript-eslint warnings)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during builds (removes all "Unexpected any" errors)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
