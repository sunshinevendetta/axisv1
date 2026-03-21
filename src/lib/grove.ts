export const GROVE_API_BASE = "https://api.grove.storage";
export const DEFAULT_CHAIN_ID = 8453;
export const DEFAULT_VISIBILITY = "open";
export const DEFAULT_MUTABILITY = "immutable";
export const MAX_UPLOAD_SIZE_BYTES = 125 * 1024 * 1024;

export type AssetKind =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "html"
  | "json"
  | "model"
  | "archive"
  | "other";

export type AssetInput = {
  title: string;
  description: string;
  assetKind: AssetKind;
  collectionName: string;
  externalUrl: string;
  createBundle: boolean;
};

export type NormalizedGroveResponse = {
  storage_key: string | null;
  gateway_url: string | null;
  uri: string | null;
  status_url: string | null;
  items?: Array<Record<string, unknown>>;
  raw?: unknown;
  raw_text?: string;
};

export type UploadResult = {
  file_name: string;
  file_size: number;
  content_type: string;
  mode: string;
  title?: string;
  description?: string;
  asset_kind?: AssetKind;
  storage_key: string | null;
  gateway_url: string | null;
  uri: string | null;
  status_url: string | null;
  public_url?: string | null;
  embed_html: string;
  metadata_json: Record<string, unknown>;
  raw: unknown;
};

const ASSET_KIND_MIME_MAP: Record<AssetKind, string> = {
  image: "image/png",
  video: "video/mp4",
  audio: "audio/mpeg",
  document: "application/pdf",
  html: "text/html; charset=utf-8",
  json: "application/json",
  model: "model/gltf-binary",
  archive: "application/zip",
  other: "application/octet-stream",
};

const DEFAULT_EXTENSION_MAP: Partial<Record<AssetKind, string>> = {
  image: ".png",
  video: ".mp4",
  audio: ".mp3",
  document: ".pdf",
  html: ".html",
  json: ".json",
  model: ".glb",
  archive: ".zip",
};

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "audio/mpeg": ".mp3",
  "audio/wav": ".wav",
  "application/pdf": ".pdf",
  "text/html": ".html",
  "application/json": ".json",
  "application/zip": ".zip",
  "model/gltf-binary": ".glb",
};

export function slugify(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "asset";
}

export function normalizeGroveResponse(data: unknown): NormalizedGroveResponse {
  function readValue(record: Record<string, unknown>, key: string) {
    return typeof record[key] === "string" ? record[key] : null;
  }

  function pickNestedItem(record: Record<string, unknown>) {
    if (!Array.isArray(record.items)) {
      return null;
    }

    const firstItem = record.items.find(
      (item) => typeof item === "object" && item !== null && !Array.isArray(item),
    );

    return firstItem && typeof firstItem === "object" && firstItem !== null
      ? (firstItem as Record<string, unknown>)
      : null;
  }

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    const record = data as Record<string, unknown>;
    const nestedItem = pickNestedItem(record);
    return {
      storage_key: readValue(record, "storage_key") || readValue(nestedItem ?? {}, "storage_key"),
      gateway_url: readValue(record, "gateway_url") || readValue(nestedItem ?? {}, "gateway_url"),
      uri: readValue(record, "uri") || readValue(nestedItem ?? {}, "uri"),
      status_url: readValue(record, "status_url") || readValue(nestedItem ?? {}, "status_url"),
      items: Array.isArray(record.items)
        ? record.items.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && !Array.isArray(item))
        : undefined,
      ...record,
    };
  }

  if (Array.isArray(data)) {
    return {
      storage_key: null,
      gateway_url: null,
      uri: null,
      status_url: null,
      items: data,
    };
  }

  return {
    storage_key: null,
    gateway_url: null,
    uri: null,
    status_url: null,
    raw: data,
  };
}

function inferExtensionFromMime(contentType: string): string {
  const cleanType = contentType.split(";")[0].trim().toLowerCase();
  return MIME_EXTENSION_MAP[cleanType] ?? "";
}

export function buildUploadName(
  originalName: string,
  title: string,
  assetKind: AssetKind,
  index?: number,
  detectedType?: string,
): string {
  const originalExtension = originalName.includes(".")
    ? originalName.slice(originalName.lastIndexOf("."))
    : "";
  const extension =
    originalExtension ||
    inferExtensionFromMime(detectedType ?? "") ||
    DEFAULT_EXTENSION_MAP[assetKind] ||
    "";
  const suffix = typeof index === "number" ? `-${index}` : "";
  return `${slugify(title)}${suffix}${extension}`;
}

export function chooseContentType(fileName: string, detectedType: string, assetKind: AssetKind): string {
  const extension = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase() : "";
  const fromExtension = Object.entries(MIME_EXTENSION_MAP).find(([, ext]) => ext === extension)?.[0];
  return fromExtension || detectedType || ASSET_KIND_MIME_MAP[assetKind];
}

export function buildAssetMetadata(input: {
  title: string;
  description: string;
  assetKind: AssetKind;
  gatewayUrl: string | null;
  contentType: string;
  originalFileName: string;
  collectionName: string;
  externalUrl: string;
}): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    name: input.title || input.originalFileName.replace(/\.[^.]+$/, ""),
    description: input.description || `${input.assetKind} asset stored on Grove.`,
    external_url: input.externalUrl || "",
    properties: {
      storage: "Grove",
      chain: "Base",
      chain_id: DEFAULT_CHAIN_ID,
      mutability: DEFAULT_MUTABILITY,
      visibility: DEFAULT_VISIBILITY,
      asset_kind: input.assetKind,
      content_type: input.contentType,
      collection: input.collectionName || "",
      original_file_name: input.originalFileName,
    },
  };

  if (input.gatewayUrl) {
    if (input.assetKind === "image") {
      metadata.image = input.gatewayUrl;
    } else if (["video", "audio", "html", "model"].includes(input.assetKind)) {
      metadata.animation_url = input.gatewayUrl;
    } else {
      metadata.content_url = input.gatewayUrl;
    }
  }

  return metadata;
}

export function buildEmbedSnippet(
  assetKind: AssetKind,
  gatewayUrl: string | null,
  contentType: string,
  title: string,
): string {
  if (!gatewayUrl) return "";
  const safeTitle = title || "Grove asset";
  if (assetKind === "image") return `<img src="${gatewayUrl}" alt="${safeTitle}" />`;
  if (assetKind === "video") return `<video controls playsinline src="${gatewayUrl}" type="${contentType}"></video>`;
  if (assetKind === "audio") return `<audio controls src="${gatewayUrl}" type="${contentType}"></audio>`;
  if (assetKind === "html") return `<iframe src="${gatewayUrl}" title="${safeTitle}" loading="lazy"></iframe>`;
  return `<a href="${gatewayUrl}" target="_blank" rel="noreferrer">${safeTitle}</a>`;
}

export function resolvePublicAssetUrl(input: {
  gateway_url?: string | null;
  uri?: string | null;
  status_url?: string | null;
  items?: Array<Record<string, unknown>>;
}) {
  if (input.gateway_url) {
    return input.gateway_url;
  }

  const firstItem = input.items?.[0];
  if (firstItem) {
    const nestedGateway = typeof firstItem.gateway_url === "string" ? firstItem.gateway_url : null;
    const nestedUri = typeof firstItem.uri === "string" ? firstItem.uri : null;
    const nestedStatus = typeof firstItem.status_url === "string" ? firstItem.status_url : null;

    if (nestedGateway) {
      return nestedGateway;
    }

    if (nestedUri?.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${nestedUri.slice(7)}`;
    }

    if (nestedUri) {
      return nestedUri;
    }

    if (nestedStatus) {
      return nestedStatus;
    }
  }

  if (input.uri?.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${input.uri.slice(7)}`;
  }

  if (input.uri) {
    return input.uri;
  }

  return input.status_url || "";
}

export async function uploadToGrove(input: {
  bytes: Uint8Array;
  fileName: string;
  chainId?: number;
  contentType: string;
}): Promise<NormalizedGroveResponse> {
  const response = await fetch(`${GROVE_API_BASE}/?chain_id=${input.chainId ?? DEFAULT_CHAIN_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": input.contentType,
      "X-File-Name": input.fileName,
    },
    body: input.bytes,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  try {
    return normalizeGroveResponse(await response.json());
  } catch {
    return normalizeGroveResponse({
      storage_key: null,
      gateway_url: null,
      uri: null,
      status_url: null,
      raw_text: await response.text(),
    });
  }
}
