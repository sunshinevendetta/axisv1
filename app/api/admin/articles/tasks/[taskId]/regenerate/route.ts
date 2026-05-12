import { NextResponse } from "next/server";
import { readEditorialQueue } from "@/src/lib/editorial-store";
import { readTaskBundle, runEditorialJob } from "@/app/api/admin/articles/_lib";

export async function POST(_: Request, context: { params: Promise<{ taskId: string }> }) {

  const { taskId } = await context.params;
  const bundle = await readTaskBundle(taskId);

  if (!bundle) {
    return NextResponse.json({ error: `Editorial task "${taskId}" not found.` }, { status: 404 });
  }

  try {
    await runEditorialJob(bundle.job.id, bundle.task.id);
    return NextResponse.json({
      ok: true,
      taskId,
      queue: await readEditorialQueue(bundle.job.id),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to regenerate article." },
      { status: 500 },
    );
  }
}
