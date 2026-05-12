import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
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
      { protocol: "https", hostname: "**.grove.storage" },
      // Spotify CDN (artist profile images from scraper)
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "**.scdn.co" },
      { protocol: "https", hostname: "**.spotifycdn.com" },
      // Last.fm
      { protocol: "https", hostname: "**.last.fm" },
      { protocol: "https", hostname: "**.lastfm.freetls.fastly.net" },
      // MusicBrainz / Cover Art Archive
      { protocol: "https", hostname: "coverartarchive.org" },
      { protocol: "https", hostname: "**.coverartarchive.org" },
    ],
  },
  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": "./shims/async-storage.ts",
      "react-native-fs": "./shims/empty.ts",
      porto: "./shims/empty.ts",
      "porto/internal": "./shims/empty.ts",
      "@metamask/sdk": "./shims/empty.ts",
      "@safe-global/safe-apps-provider": "./shims/empty.ts",
      "@safe-global/safe-apps-sdk": "./shims/empty.ts",
    },
  },
  webpack: (config) => {
    config.watchOptions = {
      ...(config.watchOptions ?? {}),
      ignored: [
        "**/.claude/**",
        "**/.codex/**",
        "**/artifacts/**",
        "**/cache/**",
        "**/data/**",
        "**/echopulz/**",
        ...(Array.isArray(config.watchOptions?.ignored) ? config.watchOptions.ignored : []),
      ],
    };

    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@react-native-async-storage/async-storage": path.resolve(
        process.cwd(),
        "shims/async-storage.ts",
      ),
      "react-native-fs": false,
      porto: false,
      "porto/internal": false,
      "@metamask/sdk": false,
      "@safe-global/safe-apps-provider": false,
      "@safe-global/safe-apps-sdk": false,
    };

    return config;
  },
};

export default nextConfig;
