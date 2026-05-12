import { NextResponse } from "next/server";
import { syncEpisodeToRegistry } from "@/src/lib/episode-sync";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {

  const { slug } = await context.params;

  try {
    const result = await syncEpisodeToRegistry(slug);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed." },
      { status: 500 },
    );
  }
}
