import { NextResponse } from "next/server";
import { buildEpisodeAutomationSnapshotFromCatalog } from "@/src/lib/episodes";
import { readEpisodeCatalog } from "@/src/lib/episodes-store";

export async function GET() {
  const catalog = await readEpisodeCatalog();

  return NextResponse.json({
    episodes: buildEpisodeAutomationSnapshotFromCatalog(catalog),
  });
}
