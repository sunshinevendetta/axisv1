import { NextRequest, NextResponse } from "next/server";
import { readTaskBundle, updateTaskReviewState } from "@/app/api/admin/articles/_lib";

export async function POST(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {

  const { taskId } = await context.params;
  const bundle = await readTaskBundle(taskId);

  if (!bundle) {
    return NextResponse.json({ error: `Editorial task "${taskId}" not found.` }, { status: 404 });
  }

  const body = (await request.json()) as {
    decision?: "pending" | "approved" | "rejected" | "redo_requested";
    editorNotes?: string;
    status?: "needs_review" | "approved" | "rejected" | "queued";
  };

  const review = await updateTaskReviewState(bundle.task, body);
  return NextResponse.json({ ok: true, review });
}
