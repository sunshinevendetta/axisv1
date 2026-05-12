import type { ArtistZoraCacheRecord, ArtistZoraEmbed, ArtistZoraSocial } from "@/src/lib/artist-store";

const ZORA_API_BASE = "https://api-sdk.zora.engineering";
const ZORA_FETCH_RETRIES = 3;
const ZORA_RETRY_BASE_MS = 1200;

class ZoraHttpError extends Error {
  status: number;
  pathname: string;

  constructor(pathname: string, status: number, message?: string) {
    super(message ?? `Zora request failed (${status}) for ${pathname}.`);
    this.name = "ZoraHttpError";
    this.status = status;
    this.pathname = pathname;
  }
}

type ZoraProfileResponse = {
  profile?: {
    handle?: string;
    displayName?: string;
    bio?: string;
    website?: string;
    avatar?: {
      small?: string;
      medium?: string;
    };
    publicWallet?: {
      walletAddress?: string;
    };
    socialAccounts?: {
      instagram?: { username?: string };
      twitter?: { username?: string };
      tiktok?: { username?: string };
      farcaster?: { username?: string };
    };
  };
};

type ZoraProfileCoinsResponse = {
  profile?: {
    createdCoins?: {
      edges?: Array<{
        node?: {
          id?: string;
          name?: string;
          description?: string;
          address?: string;
          createdAt?: string;
          marketCap?: string;
          volume24h?: string;
          mediaContent?: {
            previewImage?: {
              medium?: string;
              small?: string;
            };
          };
        };
      }>;
    };
  };
};

function buildHeaders() {
  const headers: Record<string, string> = {
    accept: "application/json",
  };

  if (process.env.ZORA_API_KEY) {
    headers["api-key"] = process.env.ZORA_API_KEY;
  }

  return headers;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchZoraJson<T>(pathname: string, searchParams: URLSearchParams) {
  let attempt = 0;

  while (attempt < ZORA_FETCH_RETRIES) {
    attempt += 1;

    const response = await fetch(`${ZORA_API_BASE}${pathname}?${searchParams.toString()}`, {
      headers: buildHeaders(),
      next: { revalidate: 0 },
    });

    if (response.ok) {
      return response.json() as Promise<T>;
    }

    if ((response.status === 429 || response.status >= 500) && attempt < ZORA_FETCH_RETRIES) {
      await sleep(ZORA_RETRY_BASE_MS * attempt);
      continue;
    }

    throw new ZoraHttpError(pathname, response.status);
  }

  throw new ZoraHttpError(pathname, 500, `Zora request exhausted retries for ${pathname}.`);
}

async function fetchZoraProfile(identifier: string) {
  const params = new URLSearchParams({ identifier });
  const candidatePaths = [
    "/profile",
    "/api/profile",
  ];

  let lastError: Error | null = null;

  for (const pathname of candidatePaths) {
    try {
      return await fetchZoraJson<ZoraProfileResponse>(pathname, params);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown Zora profile error.");
      if (error instanceof ZoraHttpError && error.status === 429) {
        throw new Error(`Zora rate limit hit while fetching profile for ${identifier}. Add ZORA_API_KEY or retry later.`);
      }
      if (error instanceof ZoraHttpError && error.status !== 404) {
        throw lastError;
      }
      continue;
    }
  }

  throw lastError ?? new Error("Could not resolve a Zora profile endpoint.");
}

function maybeUrl(value: string | undefined | null) {
  return value && value.trim() ? value.trim() : null;
}

function buildSocials(profile: NonNullable<ZoraProfileResponse["profile"]>, handle: string | null): ArtistZoraSocial[] {
  const socials: ArtistZoraSocial[] = [];

  if (profile.website) {
    socials.push({ platform: "website", label: "Website", href: profile.website });
  }
  if (profile.socialAccounts?.instagram?.username) {
    socials.push({
      platform: "instagram",
      label: "Instagram",
      href: `https://instagram.com/${profile.socialAccounts.instagram.username}`,
    });
  }
  if (profile.socialAccounts?.twitter?.username) {
    socials.push({
      platform: "twitter",
      label: "X",
      href: `https://x.com/${profile.socialAccounts.twitter.username}`,
    });
  }
  if (profile.socialAccounts?.tiktok?.username) {
    socials.push({
      platform: "tiktok",
      label: "TikTok",
      href: `https://www.tiktok.com/@${profile.socialAccounts.tiktok.username}`,
    });
  }
  if (profile.socialAccounts?.farcaster?.username) {
    socials.push({
      platform: "farcaster",
      label: "Farcaster",
      href: `https://warpcast.com/${profile.socialAccounts.farcaster.username}`,
    });
  }
  if (handle) {
    socials.push({
      platform: "zora",
      label: "Zora",
      href: `https://zora.co/@${handle}`,
    });
  }

  return socials;
}

function buildEmbed(coin: NonNullable<NonNullable<NonNullable<ZoraProfileCoinsResponse["profile"]>["createdCoins"]>["edges"]>[number]["node"]): ArtistZoraEmbed | null {
  if (!coin?.id || !coin.address) {
    return null;
  }

  return {
    id: coin.id,
    title: coin.name?.trim() || "Untitled",
    description: coin.description?.trim() || "",
    address: coin.address,
    image: maybeUrl(coin.mediaContent?.previewImage?.medium ?? coin.mediaContent?.previewImage?.small),
    createdAt: maybeUrl(coin.createdAt),
    marketCap: maybeUrl(coin.marketCap),
    volume24h: maybeUrl(coin.volume24h),
    href: `https://zora.co/coin/base:${coin.address}`,
  };
}

async function fetchProfileCoins(identifier: string) {
  const params = new URLSearchParams({
    identifier,
    count: "2",
  });

  const candidatePaths = [
    "/profile/coins",
    "/profile-coins",
    "/profileCoins",
    "/api/profile/coins",
    "/api/profile-coins",
  ];

  let lastError: Error | null = null;

  for (const pathname of candidatePaths) {
    try {
      return await fetchZoraJson<ZoraProfileCoinsResponse>(pathname, params);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown Zora profile-coins error.");
      if (error instanceof ZoraHttpError && error.status === 429) {
        throw new Error(`Zora rate limit hit while fetching embeds for ${identifier}. Add ZORA_API_KEY or retry later.`);
      }
      if (error instanceof ZoraHttpError && error.status !== 404) {
        throw lastError;
      }
      continue;
    }
  }

  throw lastError ?? new Error("Could not resolve a Zora profile-coins endpoint.");
}

export async function fetchArtistZoraRecord(identifier: string): Promise<ArtistZoraCacheRecord> {
  const profileResponse = await fetchZoraProfile(identifier);
  const profile = profileResponse.profile ?? null;

  if (!profile) {
    return {
      identifier,
      syncedAt: new Date().toISOString(),
      profile: null,
      embeds: [],
      error: "Profile not found on Zora.",
    };
  }

  const handle = maybeUrl(profile.handle);
  const coinsResponse = await fetchProfileCoins(identifier);
  const embeds = (coinsResponse.profile?.createdCoins?.edges ?? [])
    .map((edge) => buildEmbed(edge.node))
    .filter((value): value is ArtistZoraEmbed => Boolean(value))
    .slice(0, 2);

  return {
    identifier,
    syncedAt: new Date().toISOString(),
    profile: {
      handle,
      displayName: maybeUrl(profile.displayName),
      bio: maybeUrl(profile.bio),
      website: maybeUrl(profile.website),
      avatar: maybeUrl(profile.avatar?.medium ?? profile.avatar?.small),
      walletAddress: maybeUrl(profile.publicWallet?.walletAddress),
      socials: buildSocials(profile, handle),
    },
    embeds,
    error: null,
  };
}
