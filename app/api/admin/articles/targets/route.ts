import { NextRequest, NextResponse } from "next/server";
import { listEditorialTargets } from "@/src/lib/editorial-store";
import { writeSimpleTarget } from "@/app/api/admin/articles/_lib";

export async function GET() {

  return NextResponse.json({ targets: await listEditorialTargets() });
}

export async function POST(request: NextRequest) {

  try {
    const body = (await request.json()) as {
      name: string;
      type?: "artist" | "genre" | "scene";
      sourceMode?: "existing_db" | "new_target" | "mixed";
      summary?: string;
      genres?: string[];
      tags?: string[];
      relatedArtists?: string[];
      city?: string | null;
    };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Target name is required." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      target: await writeSimpleTarget(body),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create target." },
      { status: 500 },
    );
  }
}
