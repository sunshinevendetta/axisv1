import { NextResponse } from "next/server";
import { readEpisodeCatalog } from "@/src/lib/episodes-store";

export async function GET() {

  const catalog = await readEpisodeCatalog();

  return NextResponse.json({
    episodes: catalog,
  });
}
