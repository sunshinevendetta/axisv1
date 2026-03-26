import { promises as fs } from "node:fs";
import path from "node:path";
import { episodeCatalog as fallbackCatalog, type EpisodeCatalogEntry } from "@/src/content/episodes";

const EPISODES_FILE_PATH = path.join(process.cwd(), "content", "episodes.json");

function normalizeEpisodeCatalogEntry(entry: EpisodeCatalogEntry): EpisodeCatalogEntry {
  return {
    ...entry,
    lumaEventId: entry.lumaEventId?.trim() || undefined,
    lumaUrl: entry.lumaUrl?.trim() || undefined,
    registryEventId: typeof entry.registryEventId === "number" ? entry.registryEventId : undefined,
    assets: {
      ...entry.assets,
      imageUri: entry.assets.imageUri?.trim() || undefined,
    },
  };
}

export async function readEpisodeCatalog(): Promise<EpisodeCatalogEntry[]> {
  try {
    const fileContents = await fs.readFile(EPISODES_FILE_PATH, "utf8");
    const parsed = JSON.parse(fileContents) as EpisodeCatalogEntry[];

    if (!Array.isArray(parsed)) {
      throw new Error("Episodes catalog must be an array.");
    }

    return parsed.map(normalizeEpisodeCatalogEntry);
  } catch (error) {
    console.error("Falling back to bundled episode catalog:", error);
    return fallbackCatalog.map(normalizeEpisodeCatalogEntry);
  }
}

export async function writeEpisodeCatalog(catalog: EpisodeCatalogEntry[]) {
  const normalizedCatalog = catalog.map(normalizeEpisodeCatalogEntry);
  await fs.mkdir(path.dirname(EPISODES_FILE_PATH), { recursive: true });
  await fs.writeFile(EPISODES_FILE_PATH, `${JSON.stringify(normalizedCatalog, null, 2)}\n`, "utf8");
}

export async function getStoredEpisodeBySlug(slug: string) {
  const catalog = await readEpisodeCatalog();
  return catalog.find((episode) => episode.slug === slug);
}
