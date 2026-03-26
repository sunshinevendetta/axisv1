import { promises as fs } from "node:fs";
import path from "node:path";
import {
  collectiblesCatalog as fallbackCatalog,
  type EpisodeCollectibleRecord,
  type EpisodeCollectiblesCatalog,
} from "@/src/content/collectibles";

const COLLECTIBLES_FILE_PATH = path.join(process.cwd(), "content", "episode-collectibles.json");

function normalizeRecord(record: EpisodeCollectibleRecord): EpisodeCollectibleRecord {
  return {
    ...record,
    claimOpen: Boolean(record.claimOpen),
    chainId: typeof record.chainId === "number" ? record.chainId : undefined,
    contractAddress: record.contractAddress?.trim() || undefined,
    baseUri: record.baseUri?.trim() || undefined,
    collectionMetadataUri: record.collectionMetadataUri?.trim() || undefined,
    nfcBaseUrl: record.nfcBaseUrl?.trim() || undefined,
    tokens: [...record.tokens]
      .map((token) => ({
        ...token,
        tokenId: Number(token.tokenId),
        remaining: Number(token.remaining),
      }))
      .sort((left, right) => left.tokenId - right.tokenId),
  };
}

function normalizeCatalog(catalog: EpisodeCollectiblesCatalog): EpisodeCollectiblesCatalog {
  return {
    collection: { ...catalog.collection },
    episodes: [...catalog.episodes]
      .map(normalizeRecord)
      .sort((left, right) => left.number - right.number),
  };
}

export async function readCollectiblesCatalog(): Promise<EpisodeCollectiblesCatalog> {
  try {
    const fileContents = await fs.readFile(COLLECTIBLES_FILE_PATH, "utf8");
    const parsed = JSON.parse(fileContents) as EpisodeCollectiblesCatalog;

    if (!parsed || !Array.isArray(parsed.episodes)) {
      throw new Error("Collectibles catalog must contain an episodes array.");
    }

    return normalizeCatalog(parsed);
  } catch (error) {
    console.error("Falling back to bundled collectibles catalog:", error);
    return normalizeCatalog(fallbackCatalog);
  }
}

export async function writeCollectiblesCatalog(catalog: EpisodeCollectiblesCatalog) {
  const normalizedCatalog = normalizeCatalog(catalog);
  await fs.mkdir(path.dirname(COLLECTIBLES_FILE_PATH), { recursive: true });
  await fs.writeFile(COLLECTIBLES_FILE_PATH, `${JSON.stringify(normalizedCatalog, null, 2)}\n`, "utf8");
}
