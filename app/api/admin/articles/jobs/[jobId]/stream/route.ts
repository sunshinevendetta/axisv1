import { execFile } from "node:child_process";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { readEditorialJob } from "@/src/lib/editorial-store";

const REPO_ROOT = path.resolve(process.cwd());
const ENRICHER_ENTRY = path.join(REPO_ROOT, "tools/article-enricher/enricher.ts");

export async function POST(request: NextRequest, context: { params: Promise<{ jobId: string }> }) {

  const { jobId } = await context.params;
  const job = await readEditorialJob(jobId);

  if (!job) {
    return NextResponse.json({ error: `Editorial job "${jobId}" not found.` }, { status: 404 });
  }

  let body: { taskId?: string } = {};

  try {
    body = (await request.json()) as { taskId?: string };
  } catch {
    body = {};
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send(obj: object) {
        controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
      }

      const env: NodeJS.ProcessEnv = {
        ...process.env,
        NOUS_API_KEY: process.env.NOUS_API_KEY ?? "",
        ARTICLE_JOB_ID: jobId,
      };

      if (typeof body.taskId === "string" && body.taskId.trim()) {
        env.ARTICLE_TASK_ID = body.taskId.trim();
      }

      send({
        type: "log",
        text: `Starting editorial job ${jobId}${env.ARTICLE_TASK_ID ? ` for task ${env.ARTICLE_TASK_ID}` : ""}.`,
      });

      const child = execFile(
        process.execPath,
        ["--import", "tsx", ENRICHER_ENTRY],
        {
          cwd: REPO_ROOT,
          env,
          maxBuffer: 10 * 1024 * 1024,
        },
      );

      child.stdout?.on("data", (chunk: Buffer) => {
        const lines = chunk.toString().split("\n").filter(Boolean);
        for (const line of lines) {
          send({ type: "log", text: line });
        }
      });

      child.stderr?.on("data", (chunk: Buffer) => {
        const lines = chunk.toString().split("\n").filter(Boolean);
        for (const line of lines) {
          send({ type: "log", text: line });
        }
      });

      child.on("close", (code: number | null) => {
        if (code === 0) {
          send({ type: "done", summary: { exitCode: 0, jobId, taskId: env.ARTICLE_TASK_ID ?? null } });
        } else {
          send({ type: "error", text: `Editorial job exited with code ${code}` });
        }
        controller.close();
      });

      child.on("error", (error: Error) => {
        send({ type: "error", text: error.message });
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
