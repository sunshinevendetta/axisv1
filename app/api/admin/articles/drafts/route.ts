import { NextResponse } from "next/server";
import { listGeneratedDrafts } from "@/app/api/admin/articles/_lib";

export async function GET() {

  try {
    return NextResponse.json({ drafts: await listGeneratedDrafts() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load generated drafts." },
      { status: 500 },
    );
  }
}
