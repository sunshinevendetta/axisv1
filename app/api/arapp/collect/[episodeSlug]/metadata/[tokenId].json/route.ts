import { NextResponse } from "next/server";
import { buildARAppCollectMetadata, getEpisodeBySlug, getTokensByEpisode } from "@/src/lib/arapp-collect";

type RouteContext = {
  params: Promise<{
    episodeSlug: string;
    tokenId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { episodeSlug, tokenId } = await context.params;
  const numericTokenId = Number(tokenId);

  if (!Number.isInteger(numericTokenId) || numericTokenId < 0) {
    return NextResponse.json({ error: "Invalid token ID" }, { status: 400 });
  }

  const episode = getEpisodeBySlug(episodeSlug);
  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  const token = getTokensByEpisode(episodeSlug).find((entry) => entry.tokenId === numericTokenId);
  if (!token) {
    return NextResponse.json({ error: "Collectible not found" }, { status: 404 });
  }

  return NextResponse.json(buildARAppCollectMetadata(token));
}
