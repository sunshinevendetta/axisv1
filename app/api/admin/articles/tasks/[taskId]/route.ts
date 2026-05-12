import { NextResponse } from "next/server";
import { readTaskBundle } from "@/app/api/admin/articles/_lib";

export async function GET(_: Request, context: { params: Promise<{ taskId: string }> }) {

  const { taskId } = await context.params;
  const bundle = await readTaskBundle(taskId);

  if (!bundle) {
    return NextResponse.json({ error: `Editorial task "${taskId}" not found.` }, { status: 404 });
  }

  return NextResponse.json(bundle);
}
