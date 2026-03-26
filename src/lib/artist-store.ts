import { promises as fs } from "node:fs";
import path from "node:path";

export type ArtistZoraSocial = {
  platform: "website" | "instagram" | "twitter" | "tiktok" | "farcaster" | "zora";
  label: string;
  href: string;
};

export type ArtistZoraEmbed = {
  id: string;
  title: string;
  description: string;
  address: string;
  image: string | null;
  createdAt: string | null;
  marketCap: string | null;
  volume24h: string | null;
  href: string;
};

export type ArtistZoraCacheRecord = {
  identifier: string;
  syncedAt: string;
  profile: {
    handle: string | null;
    displayName: string | null;
    bio: string | null;
    website: string | null;
    avatar: string | null;
    walletAddress: string | null;
    socials: ArtistZoraSocial[];
  } | null;
  embeds: ArtistZoraEmbed[];
  error?: string | null;
};

export type ArtistZoraCache = Record<string, ArtistZoraCacheRecord>;

const ARTIST_ZORA_CACHE_PATH = path.join(process.cwd(), "content", "artist-zora-cache.json");

export async function readArtistZoraCache(): Promise<ArtistZoraCache> {
  try {
    const fileContents = await fs.readFile(ARTIST_ZORA_CACHE_PATH, "utf8");
    const parsed = JSON.parse(fileContents) as ArtistZoraCache;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Artist Zora cache must be an object.");
    }

    return parsed;
  } catch {
    return {};
  }
}

export async function writeArtistZoraCache(cache: ArtistZoraCache) {
  await fs.mkdir(path.dirname(ARTIST_ZORA_CACHE_PATH), { recursive: true });
  await fs.writeFile(ARTIST_ZORA_CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}
