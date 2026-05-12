import { NextResponse } from "next/server";
import { readEditorialJob, readEditorialQueue } from "@/src/lib/editorial-store";
import { runEditorialJob } from "@/app/api/admin/articles/_lib";

export async function POST(_: Request, context: { params: Promise<{ jobId: string }> }) {

  const { jobId } = await context.params;
  const job = await readEditorialJob(jobId);

  if (!job) {
    return NextResponse.json({ error: `Editorial job "${jobId}" not found.` }, { status: 404 });
  }

  try {
    await runEditorialJob(jobId);
    return NextResponse.json({
      job: await readEditorialJob(jobId),
      queue: await readEditorialQueue(jobId),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to run editorial job." },
      { status: 500 },
    );
  }
}
