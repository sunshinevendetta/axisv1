import { NextResponse } from "next/server";
import { buildEpisodeMetadata, getEpisodeFromCatalog } from "@/src/lib/episodes";
import { readEpisodeCatalog } from "@/src/lib/episodes-store";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const catalog = await readEpisodeCatalog();
  const episode = getEpisodeFromCatalog(catalog, slug);

  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  return NextResponse.json(buildEpisodeMetadata(episode));
}
