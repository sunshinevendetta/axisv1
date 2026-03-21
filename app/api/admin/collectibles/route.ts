import { NextRequest, NextResponse } from "next/server";
import { hasOwnerSession } from "@/src/lib/owner-session";
import { readCollectiblesCatalog, writeCollectiblesCatalog } from "@/src/lib/collectibles-store";
import type { EpisodeCollectibleRecord } from "@/src/content/collectibles";

export async function GET() {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const catalog = await readCollectiblesCatalog();
  return NextResponse.json(catalog);
}

export async function PUT(request: NextRequest) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    episode?: EpisodeCollectibleRecord;
  };

  if (!payload.episode) {
    return NextResponse.json({ error: "Episode payload is required." }, { status: 400 });
  }

  const catalog = await readCollectiblesCatalog();
  const incoming = payload.episode;
  const index = catalog.episodes.findIndex((entry) => entry.slug === incoming.slug);

  if (index >= 0) {
    catalog.episodes[index] = incoming;
  } else {
    catalog.episodes.push(incoming);
  }

  await writeCollectiblesCatalog(catalog);

  return NextResponse.json({
    episode: incoming,
    episodes: catalog.episodes,
  });
}
