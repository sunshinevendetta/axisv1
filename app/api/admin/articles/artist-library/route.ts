import { NextRequest, NextResponse } from "next/server";
import { loadArtistLibrary } from "@/app/api/admin/articles/_lib";

export async function GET(request: NextRequest) {

  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const limitParam = url.searchParams.get("limit")?.trim().toLowerCase() ?? "80";
    const limit = limitParam === "all" ? Number.MAX_SAFE_INTEGER : Number.parseInt(limitParam, 10) || 80;

    const artists = (await loadArtistLibrary())
      .filter((artist) => {
        if (!query) return true;
        const haystack = [
          artist.slug,
          artist.name,
          artist.summary,
          artist.genres.join(" "),
          artist.tags.join(" "),
          artist.similar.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, limit);

    return NextResponse.json({ artists });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load artist library." },
      { status: 500 },
    );
  }
}
