import { NextResponse } from "next/server";
import { readEditorialJob, readEditorialQueue } from "@/src/lib/editorial-store";

export async function GET(_: Request, context: { params: Promise<{ jobId: string }> }) {

  const { jobId } = await context.params;
  const [job, queue] = await Promise.all([
    readEditorialJob(jobId),
    readEditorialQueue(jobId),
  ]);

  if (!job) {
    return NextResponse.json({ error: `Editorial job "${jobId}" not found.` }, { status: 404 });
  }

  return NextResponse.json({ job, queue });
}
