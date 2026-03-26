import { NextRequest, NextResponse } from "next/server";
import { hasOwnerSession } from "@/src/lib/owner-session";
import { artistProfiles, findArtistProfile } from "@/src/content/artists";
import { readArtistZoraCache, writeArtistZoraCache } from "@/src/lib/artist-store";
import { fetchArtistZoraRecord } from "@/src/lib/zora";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";

  const targets = slug
    ? (() => {
        const artist = findArtistProfile(slug);
        return artist ? [artist] : [];
      })()
    : artistProfiles.filter((artist) => Boolean(artist.zoraHandle));

  if (targets.length === 0) {
    return NextResponse.json({ error: slug ? "Artist not found or has no Zora handle." : "No artists with Zora handles found." }, { status: 404 });
  }

  const cache = await readArtistZoraCache();
  const results: Array<{ slug: string; identifier: string; status: "synced" | "failed"; message: string }> = [];

  for (const artist of targets) {
    const identifier = artist.zoraHandle;

    if (!identifier) {
      results.push({
        slug: artist.slug,
        identifier: "",
        status: "failed",
        message: "Missing Zora identifier.",
      });
      continue;
    }

    try {
      const record = await fetchArtistZoraRecord(identifier);
      cache[artist.slug] = record;
      results.push({
        slug: artist.slug,
        identifier,
        status: "synced",
        message: `Profile synced with ${record.embeds.length} embeds.`,
      });
    } catch (error) {
      cache[artist.slug] = {
        identifier,
        syncedAt: new Date().toISOString(),
        profile: null,
        embeds: [],
        error: error instanceof Error ? error.message : "Unknown Zora sync error.",
      };
      results.push({
        slug: artist.slug,
        identifier,
        status: "failed",
        message: error instanceof Error ? error.message : "Unknown Zora sync error.",
      });
    }

    await sleep(250);
  }

  await writeArtistZoraCache(cache);

  return NextResponse.json({
    synced: results.filter((item) => item.status === "synced").length,
    failed: results.filter((item) => item.status === "failed").length,
    results,
  });
}
