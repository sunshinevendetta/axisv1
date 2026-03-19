import { NextRequest, NextResponse } from "next/server";
import { readEpisodeCatalog, writeEpisodeCatalog } from "@/src/lib/episodes-store";
import { hasOwnerSession } from "@/src/lib/owner-session";
import { type EpisodeCatalogEntry } from "@/src/content/episodes";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const incomingEpisode = (await request.json()) as EpisodeCatalogEntry;
  const catalog = await readEpisodeCatalog();
  const index = catalog.findIndex((episode) => episode.slug === slug);

  if (index === -1) {
    return NextResponse.json({ error: "Episode not found." }, { status: 404 });
  }

  const updatedEpisode: EpisodeCatalogEntry = {
    ...incomingEpisode,
    slug,
    id: Number(incomingEpisode.id),
    season: Number(incomingEpisode.season),
    year: Number(incomingEpisode.year),
    registryEventId:
      incomingEpisode.registryEventId === undefined || incomingEpisode.registryEventId === null
        ? undefined
        : Number(incomingEpisode.registryEventId),
  };

  catalog[index] = updatedEpisode;
  await writeEpisodeCatalog(catalog);

  return NextResponse.json({ episode: updatedEpisode });
}
