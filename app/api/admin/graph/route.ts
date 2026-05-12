import { NextResponse } from "next/server";
import { compileAxisGraphToDisk, readGraphHqState } from "@/src/lib/graph-hq";

export const runtime = "nodejs";

export async function GET() {

  try {
    return NextResponse.json(await readGraphHqState());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load graph state." },
      { status: 500 },
    );
  }
}

export async function POST() {

  try {
    const result = await compileAxisGraphToDisk();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to compile graph." },
      { status: 500 },
    );
  }
}
