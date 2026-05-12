import { NextRequest, NextResponse } from "next/server";
import { createEditorialJobFromInput, listJobsWithQueues } from "@/app/api/admin/articles/_lib";

export async function GET() {

  return NextResponse.json({ jobs: await listJobsWithQueues() });
}

export async function POST(request: NextRequest) {

  try {
    const body = (await request.json()) as {
      articleSourceSlug?: string;
      articleLimit?: string | number;
      artistSlugs?: string[];
      inputMode?: "raw_sources" | "artist_catalog";
      mode?: "single" | "batch" | "catalog";
      source?: "existing_db" | "new_target" | "mixed";
      targetType?: "artist" | "genre" | "scene";
      notes?: string;
    };

    const created = await createEditorialJobFromInput({
      ...body,
      createdBy: "owner",
    });

    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create editorial job." },
      { status: 500 },
    );
  }
}
