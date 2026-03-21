import { NextRequest, NextResponse } from "next/server";
import { hasOwnerSession } from "@/src/lib/owner-session";
import {
  type AssetInput,
  type AssetKind,
  DEFAULT_CHAIN_ID,
  DEFAULT_MUTABILITY,
  DEFAULT_VISIBILITY,
  MAX_UPLOAD_SIZE_BYTES,
  buildAssetMetadata,
  buildEmbedSnippet,
  buildUploadName,
  chooseContentType,
  resolvePublicAssetUrl,
  uploadToGrove,
} from "@/src/lib/grove";

function text(formData: FormData, key: string, fallback = ""): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

export async function POST(request: NextRequest) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const input: AssetInput = {
      title: text(formData, "title"),
      description: text(formData, "description"),
      assetKind: (text(formData, "asset_kind", "other") as AssetKind) || "other",
      collectionName: text(formData, "collection_name"),
      externalUrl: text(formData, "external_url"),
      createBundle: text(formData, "create_bundle", "true") !== "false",
    };

    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!files.length) {
      return NextResponse.json({ ok: false, error: "No files were uploaded." }, { status: 400 });
    }

    const results = [];

    for (const [index, file] of files.entries()) {
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return NextResponse.json(
          { ok: false, error: "Grove allows up to 125MB per file right now." },
          { status: 400 },
        );
      }

      const baseTitle = input.title || file.name.replace(/\.[^.]+$/, "") || `asset-${index + 1}`;
      const uploadName = buildUploadName(
        file.name,
        baseTitle,
        input.assetKind,
        files.length > 1 ? index + 1 : undefined,
        file.type,
      );
      const contentType = chooseContentType(uploadName, file.type, input.assetKind);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const grove = await uploadToGrove({
        bytes,
        fileName: uploadName,
        chainId: DEFAULT_CHAIN_ID,
        contentType,
      });

      const metadata = buildAssetMetadata({
        title: input.title || uploadName.replace(/\.[^.]+$/, ""),
        description: input.description,
        assetKind: input.assetKind,
        gatewayUrl: resolvePublicAssetUrl(grove),
        contentType,
        originalFileName: uploadName,
        collectionName: input.collectionName,
        externalUrl: input.externalUrl,
      });

      results.push({
        file_name: uploadName,
        file_size: file.size,
        content_type: contentType,
        mode: DEFAULT_MUTABILITY,
        title: input.title || uploadName.replace(/\.[^.]+$/, ""),
        description: input.description,
        asset_kind: input.assetKind,
        storage_key: grove.storage_key,
        gateway_url: grove.gateway_url,
        uri: grove.uri,
        status_url: grove.status_url,
        public_url: resolvePublicAssetUrl(grove),
        embed_html: buildEmbedSnippet(
          input.assetKind,
          resolvePublicAssetUrl(grove),
          contentType,
          input.title || uploadName.replace(/\.[^.]+$/, ""),
        ),
        metadata_json: metadata,
        raw: grove,
      });
    }

    return NextResponse.json({
      ok: true,
      summary: {
        count: results.length,
        chain_id: DEFAULT_CHAIN_ID,
        visibility: DEFAULT_VISIBILITY,
        mutability: DEFAULT_MUTABILITY,
        wait_for_status: false,
        max_upload_size_mb: MAX_UPLOAD_SIZE_BYTES / (1024 * 1024),
        public_read_access: true,
        collection_bundle_created: false,
      },
      results,
      asset: {
        collection_name: input.collectionName,
        external_url: input.externalUrl,
        create_bundle: input.createBundle,
        file_count: results.length,
        content_addressing: DEFAULT_MUTABILITY,
        chain_name: "Base",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: "Upload failed.", details: message },
      { status: 500 },
    );
  }
}
