import type { NextConfig } from "next";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  transpilePackages: ["hydra-synth", "jsmediatags"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.lumacdn.com" },
      // NFT metadata image hosts
      { protocol: "https", hostname: "arweave.net" },
      { protocol: "https", hostname: "**.arweave.net" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "**.ipfs.io" },
      { protocol: "https", hostname: "cloudflare-ipfs.com" },
      { protocol: "https", hostname: "nftstorage.link" },
      { protocol: "https", hostname: "**.nftstorage.link" },
      { protocol: "https", hostname: "gateway.pinata.cloud" },
      { protocol: "https", hostname: "api.grove.storage" },
    ],
  },
  eslint: {
    // Ignore ESLint errors during builds (removes all @typescript-eslint warnings)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during builds (removes all "Unexpected any" errors)
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@react-native-async-storage/async-storage": path.resolve(
        process.cwd(),
        "shims/async-storage.ts",
      ),
      // jsmediatags bundles a React Native file reader that pulls in
      // react-native-fs — stub it out so the web build doesn't break.
      "react-native-fs": false,
    };

    return config;
  },
};

export default nextConfig;
