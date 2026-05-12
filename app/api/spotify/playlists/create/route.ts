import { NextRequest, NextResponse } from "next/server";
import { artistProfiles } from "@/src/content/artists";
import rawMediaCache from "@/content/artist-media-cache.json";

type PlaylistType = "essentials" | "constellation" | "episode" | "discovery";

type RequestBody = {
  type: PlaylistType;
  artistSlug?: string;
  episodeSlug?: string;
  token: string;
};

type MediaCacheEntry = {
  slug: string;
  tracks: Array<{ id?: string; name?: string; [key: string]: unknown }>;
  [key: string]: unknown;
};

const mediaCache = rawMediaCache as Record<string, MediaCacheEntry>;

function spotifyTrackUri(id: string) {
  return `spotify:track:${id}`;
}

function validTrackIds(entry: MediaCacheEntry | undefined): string[] {
  if (!entry) return [];
  return entry.tracks
    .map((t) => (typeof t.id === "string" ? t.id.trim() : ""))
    .filter((id) => id.length > 0);
}

async function spotifyGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw Object.assign(new Error(text), { status: 502 });
  }
  return res.json() as Promise<T>;
}

async function spotifyPost<T>(
  path: string,
  token: string,
  body: unknown,
): Promise<T> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw Object.assign(new Error(text), { status: 502 });
  }
  return res.json() as Promise<T>;
}

async function addTracksInBatches(
  playlistId: string,
  uris: string[],
  token: string,
): Promise<void> {
  for (let i = 0; i < uris.length; i += 100) {
    const batch = uris.slice(i, i + 100);
    await spotifyPost(`/playlists/${playlistId}/tracks`, token, { uris: batch });
  }
}

function dedupeIds(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

function buildEssentialsUris(artistSlug: string): string[] {
  const ids = validTrackIds(mediaCache[artistSlug]).slice(0, 10);
  return ids.map(spotifyTrackUri);
}

function buildConstellationUris(artistSlug: string): string[] {
  const profile = artistProfiles.find((a) => a.slug === artistSlug);
  if (!profile) return [];

  const artistIds = validTrackIds(mediaCache[artistSlug]).slice(0, 5);

  const similarIds: string[] = [];
  for (const similarName of profile.similar) {
    const normalized = similarName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const similarProfile = artistProfiles.find(
      (a) =>
        a.slug === normalized ||
        a.name.toLowerCase() === similarName.trim().toLowerCase() ||
        a.aliases.some(
          (alias) =>
            alias
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "") === normalized,
        ),
    );
    if (similarProfile) {
      const ids = validTrackIds(mediaCache[similarProfile.slug]).slice(0, 3);
      similarIds.push(...ids);
    }
  }

  const combined = dedupeIds([...artistIds, ...similarIds]).slice(0, 50);
  return combined.map(spotifyTrackUri);
}

function buildEpisodeUris(episodeSlug: string): string[] {
  const ids: string[] = [];
  for (const profile of artistProfiles) {
    const linked = profile.linkedEpisodes.some(
      (ep) =>
        ep.href?.includes(episodeSlug) ||
        ep.label?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") === episodeSlug,
    );
    if (!linked) continue;
    const trackId = validTrackIds(mediaCache[profile.slug])[0];
    if (trackId) ids.push(trackId);
    if (ids.length >= 30) break;
  }
  return ids.map(spotifyTrackUri);
}

function buildDiscoveryUris(): string[] {
  const ids: string[] = [];
  for (const profile of artistProfiles) {
    if (!profile.featured) continue;
    const trackId = validTrackIds(mediaCache[profile.slug])[0];
    if (trackId) ids.push(trackId);
    if (ids.length >= 50) break;
  }
  return ids.map(spotifyTrackUri);
}

export async function POST(request: NextRequest) {
  let body: Partial<RequestBody>;
  try {
    body = (await request.json()) as Partial<RequestBody>;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { type, artistSlug, episodeSlug, token } = body;

  if (!token) {
    return NextResponse.json({ success: false, error: "Missing Spotify access token." }, { status: 401 });
  }

  if (!type || !["essentials", "constellation", "episode", "discovery"].includes(type)) {
    return NextResponse.json(
      { success: false, error: "type must be one of: essentials, constellation, episode, discovery." },
      { status: 400 },
    );
  }

  if ((type === "essentials" || type === "constellation") && !artistSlug) {
    return NextResponse.json(
      { success: false, error: `artistSlug is required for type "${type}".` },
      { status: 400 },
    );
  }

  if (type === "episode" && !episodeSlug) {
    return NextResponse.json(
      { success: false, error: "episodeSlug is required for type \"episode\"." },
      { status: 400 },
    );
  }

  let playlistName: string;
  let playlistDescription: string;
  let trackUris: string[];

  if (type === "essentials") {
    const profile = artistProfiles.find((a) => a.slug === artistSlug);
    if (!profile) {
      return NextResponse.json({ success: false, error: `Artist "${artistSlug}" not found.` }, { status: 400 });
    }
    playlistName = `${profile.name} — AXIS Essentials`;
    playlistDescription = `Top tracks for ${profile.name} via AXIS`;
    trackUris = buildEssentialsUris(artistSlug!);
  } else if (type === "constellation") {
    const profile = artistProfiles.find((a) => a.slug === artistSlug);
    if (!profile) {
      return NextResponse.json({ success: false, error: `Artist "${artistSlug}" not found.` }, { status: 400 });
    }
    playlistName = `${profile.name} — AXIS Constellation`;
    playlistDescription = `${profile.name} and their orbit, via AXIS`;
    trackUris = buildConstellationUris(artistSlug!);
  } else if (type === "episode") {
    playlistName = `${episodeSlug} — AXIS Soundtrack`;
    playlistDescription = `The sound of ${episodeSlug} via AXIS`;
    trackUris = buildEpisodeUris(episodeSlug!);
  } else {
    playlistName = "AXIS Discovery";
    playlistDescription = "The AXIS artist index — one track each";
    trackUris = buildDiscoveryUris();
  }

  if (trackUris.length === 0) {
    return NextResponse.json(
      { success: false, error: "No tracks found for this playlist configuration." },
      { status: 404 },
    );
  }

  try {
    const me = await spotifyGet<{ id: string }>("/me", token);
    const userId = me.id;

    const playlist = await spotifyPost<{ id: string }>(
      `/users/${userId}/playlists`,
      token,
      { name: playlistName, description: playlistDescription, public: false },
    );
    const playlistId = playlist.id;

    await addTracksInBatches(playlistId, trackUris, token);

    return NextResponse.json({
      success: true,
      playlistId,
      playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
      trackCount: trackUris.length,
      name: playlistName,
    });
  } catch (err) {
    const error = err as Error & { status?: number };
    const status = error.status === 502 ? 502 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
