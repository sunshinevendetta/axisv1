import {
  collectiblesCatalog as fallbackCatalog,
  type EpisodeCollectibleRecord,
  type EpisodeCollectiblesCatalog,
} from "@/src/content/collectibles";
import { readJsonFile, writeJsonFile, isRecord } from "@/src/lib/json-store";

const COLLECTIBLES_FILE_PATH = `${process.cwd()}/content/episode-collectibles.json`;

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
      .sort((left, right) => left.slug.localeCompare(right.slug, undefined, { numeric: true })),
  };
}

function isCollectiblesCatalog(value: unknown): value is EpisodeCollectiblesCatalog {
  return isRecord(value) && Array.isArray(value.episodes);
}

export async function readCollectiblesCatalog(): Promise<EpisodeCollectiblesCatalog> {
  const catalog = await readJsonFile(COLLECTIBLES_FILE_PATH, {
    fallback: normalizeCatalog(fallbackCatalog),
    validate: isCollectiblesCatalog,
    onError: (error) => {
      console.error("Falling back to bundled collectibles catalog:", error);
    },
  });

  return normalizeCatalog(catalog);
}

export async function writeCollectiblesCatalog(catalog: EpisodeCollectiblesCatalog) {
  await writeJsonFile(COLLECTIBLES_FILE_PATH, normalizeCatalog(catalog));
}
