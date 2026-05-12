import { NextRequest, NextResponse } from "next/server";
import { loadRawArticles, summarizeRawArticle } from "@/app/api/admin/articles/_lib";

export async function GET(request: NextRequest) {

  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const limitParam = url.searchParams.get("limit")?.trim().toLowerCase() ?? "60";
    const limit = limitParam === "all" ? Number.MAX_SAFE_INTEGER : Number.parseInt(limitParam, 10) || 60;

    const sources = (await loadRawArticles())
      .filter((raw) => {
        if (!query) return true;
        const haystack = [raw.slug, raw.id, raw.folder ?? "", raw.text ?? ""].join(" ").toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, limit)
      .map(summarizeRawArticle);

    return NextResponse.json({ sources });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load raw article sources." },
      { status: 500 },
    );
  }
}
