import { NextResponse } from "next/server";
import { readEpisodeCatalog } from "@/src/lib/episodes-store";
import { hasOwnerSession } from "@/src/lib/owner-session";

export async function GET() {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const catalog = await readEpisodeCatalog();

  return NextResponse.json({
    episodes: catalog,
  });
}
