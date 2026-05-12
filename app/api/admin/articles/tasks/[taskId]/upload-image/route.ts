import { NextResponse } from "next/server";
import { uploadToGrove, resolvePublicAssetUrl } from "@/src/lib/grove";
import { findEditorialTask, readEditorialArtifacts } from "@/src/lib/editorial-store";

export async function POST(_: Request, context: { params: Promise<{ taskId: string }> }) {

  const { taskId } = await context.params;

  const resolved = await findEditorialTask(taskId);
  if (!resolved) {
    return NextResponse.json({ error: `Task "${taskId}" not found.` }, { status: 404 });
  }

  const artifacts = await readEditorialArtifacts<Record<string, unknown>>(resolved.job.id, resolved.task.id);
  const article = artifacts.draft?.article as Record<string, unknown> | undefined;
  const imageUrl = typeof article?.image_url === "string" ? article.image_url : null;

  if (!imageUrl) {
    return NextResponse.json({ error: "No image_url found in draft artifact." }, { status: 400 });
  }

  let imageBytes: Uint8Array;
  let contentType = "image/jpeg";

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch image: ${res.status} ${res.statusText}` }, { status: 502 });
    }
    const ct = res.headers.get("content-type");
    if (ct) contentType = ct.split(";")[0].trim();
    const buffer = await res.arrayBuffer();
    imageBytes = new Uint8Array(buffer);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch image." },
      { status: 502 },
    );
  }

  const ext = contentType === "image/png" ? ".png" : contentType === "image/webp" ? ".webp" : ".jpg";
  const fileName = `${resolved.task.slug ?? taskId}${ext}`;

  try {
    const upload = await uploadToGrove({ bytes: imageBytes, fileName, contentType });
    return NextResponse.json({
      groveUri: upload.uri,
      groveGatewayUrl: resolvePublicAssetUrl(upload),
      groveStorageKey: upload.storage_key,
      originalUrl: imageUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Grove upload failed." },
      { status: 500 },
    );
  }
}
