import { NextResponse } from "next/server";
import { publishEditorialTask } from "@/src/lib/editorial-publish";

export async function POST(req: Request, context: { params: Promise<{ taskId: string }> }) {

  const { taskId } = await context.params;

  const body = (await req.json().catch(() => ({}))) as { imageGroveUrl?: string };
  const imageGroveUrl = typeof body.imageGroveUrl === "string" && body.imageGroveUrl.trim()
    ? body.imageGroveUrl.trim()
    : undefined;

  try {
    const result = await publishEditorialTask(taskId, { imageGroveUrl });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish article." },
      { status: 500 },
    );
  }
}
