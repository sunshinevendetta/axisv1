/**
 * POST /api/admin/artists/scrape
 *
 * Runs the artist scraper pipeline (Last.fm + MusicBrainz + Spotify)
 * and streams log output back to the client as newline-delimited JSON events.
 *
 * Body:
 *   { artists?: string[] }   — optional subset; omit to run all from config
 *
 * Each streamed line is a JSON object:
 *   { type: "log", text: string }
 *   { type: "done", summary: object }
 *   { type: "error", text: string }
 *
 * Auth: owner session required.
 */

import { NextRequest } from "next/server";
import { hasOwnerSession } from "@/src/lib/owner-session";
import { execFile } from "node:child_process";
import path from "node:path";

const REPO_ROOT = path.resolve(process.cwd());
const SCRAPER_ENTRY = path.join(REPO_ROOT, "tools/artist-scraper/scraper.ts");

export async function POST(request: NextRequest) {
  if (!(await hasOwnerSession())) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json().catch(() => ({})) as { artists?: string[] };
  const artistOverride = Array.isArray(body.artists) ? body.artists : null;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send(obj: object) {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      }

      // Build env — pass API keys from process.env
      const env: NodeJS.ProcessEnv = {
        ...process.env,
        LASTFM_API_KEY: process.env.LASTFM_API_KEY ?? "",
        SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ?? "",
        SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ?? "",
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
      };

      // If specific artists requested, write a temp override via env var
      if (artistOverride) {
        env["SCRAPER_ARTIST_OVERRIDE"] = artistOverride.join("|");
      }

      const child = execFile(
        "npx",
        ["tsx", SCRAPER_ENTRY],
        { cwd: REPO_ROOT, env, shell: true, maxBuffer: 10 * 1024 * 1024 },
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
          // tsx/Node warnings go to stderr — still surface them
          send({ type: "log", text: line });
        }
      });

      child.on("close", (code: number | null) => {
        if (code === 0) {
          send({ type: "done", summary: { exitCode: 0 } });
        } else {
          send({ type: "error", text: `Scraper exited with code ${code}` });
        }
        controller.close();
      });

      child.on("error", (err: Error) => {
        send({ type: "error", text: err.message });
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
