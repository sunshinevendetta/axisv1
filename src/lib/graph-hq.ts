import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildAxisGraphFiles } from "@/src/lib/graph-compiler";
import type {
  AxisGraphNodeType,
  AxisNodesFile,
  AxisRouteIndexFile,
} from "@/src/types/graph";

const GRAPH_OUTPUT_DIR = path.join(process.cwd(), "content", "graph");

export const GRAPH_SOURCE_FILES = [
  "content/episodes.json",
  "content/episode-collectibles.json",
  "content/magazine.json",
  "content/mixtapes.json",
  "public/data/artists.json",
  "content/music-artists.json",
  "content/artist-zora-cache.json",
  "content/artist-media-cache.json",
] as const;

export const GRAPH_OUTPUT_FILES = [
  "content/graph/nodes.json",
  "content/graph/route-index.json",
] as const;

export type GraphFileState = {
  path: string;
  exists: boolean;
  size: number | null;
  updatedAt: string | null;
  validJson: boolean | null;
  error: string | null;
};

export type GraphSummary = {
  version: string;
  generatedAt: string;
  nodeCount: number;
  routeCount: number;
  canonicalCount: number;
  nodeTypeCounts: Partial<Record<AxisGraphNodeType, number>>;
};

export type GraphHqState = {
  summary: GraphSummary | null;
  sourceFiles: GraphFileState[];
  outputFiles: GraphFileState[];
  stale: boolean;
};

function absolutePath(relativePath: string) {
  return path.join(process.cwd(), relativePath);
}

async function describeJsonFile(relativePath: string): Promise<GraphFileState> {
  try {
    const absolute = absolutePath(relativePath);
    const [info, raw] = await Promise.all([
      stat(absolute),
      readFile(absolute, "utf8"),
    ]);

    try {
      JSON.parse(raw);

      return {
        path: relativePath,
        exists: true,
        size: info.size,
        updatedAt: info.mtime.toISOString(),
        validJson: true,
        error: null,
      };
    } catch (error) {
      return {
        path: relativePath,
        exists: true,
        size: info.size,
        updatedAt: info.mtime.toISOString(),
        validJson: false,
        error: error instanceof Error ? error.message : "Invalid JSON.",
      };
    }
  } catch (error) {
    return {
      path: relativePath,
      exists: false,
      size: null,
      updatedAt: null,
      validJson: null,
      error: error instanceof Error ? error.message : "File unavailable.",
    };
  }
}

function createGraphSummary(
  nodesFile: AxisNodesFile,
  routeIndexFile: AxisRouteIndexFile,
): GraphSummary {
  const nodeTypeCounts = Object.values(nodesFile.nodes).reduce<
    Partial<Record<AxisGraphNodeType, number>>
  >((counts, node) => {
    counts[node.type] = (counts[node.type] ?? 0) + 1;
    return counts;
  }, {});

  return {
    version: nodesFile.version,
    generatedAt: nodesFile.generatedAt,
    nodeCount: Object.keys(nodesFile.nodes).length,
    routeCount: Object.keys(routeIndexFile.routes).length,
    canonicalCount: Object.keys(routeIndexFile.canonical).length,
    nodeTypeCounts,
  };
}

function parseOutputFiles(
  nodesRaw: string,
  routeIndexRaw: string,
): GraphSummary {
  const nodesFile = JSON.parse(nodesRaw) as AxisNodesFile;
  const routeIndexFile = JSON.parse(routeIndexRaw) as AxisRouteIndexFile;
  return createGraphSummary(nodesFile, routeIndexFile);
}

function toTimestamp(value: string | null) {
  return value ? Date.parse(value) : Number.NaN;
}

function computeStaleState(
  sourceFiles: GraphFileState[],
  outputFiles: GraphFileState[],
): boolean {
  const newestSource = Math.max(
    ...sourceFiles.map((file) => toTimestamp(file.updatedAt)).filter(Number.isFinite),
  );
  const oldestOutput = Math.min(
    ...outputFiles.map((file) => toTimestamp(file.updatedAt)).filter(Number.isFinite),
  );

  if (!Number.isFinite(newestSource) || !Number.isFinite(oldestOutput)) {
    return true;
  }

  return newestSource > oldestOutput;
}

export async function readGraphHqState(): Promise<GraphHqState> {
  const [sourceFiles, nodesState, routeIndexState] = await Promise.all([
    Promise.all(GRAPH_SOURCE_FILES.map((relativePath) => describeJsonFile(relativePath))),
    describeJsonFile("content/graph/nodes.json"),
    describeJsonFile("content/graph/route-index.json"),
  ]);

  const outputFiles = [nodesState, routeIndexState];
  let summary: GraphSummary | null = null;

  if (nodesState.exists && routeIndexState.exists && nodesState.validJson && routeIndexState.validJson) {
    const [nodesRaw, routeIndexRaw] = await Promise.all([
      readFile(absolutePath("content/graph/nodes.json"), "utf8"),
      readFile(absolutePath("content/graph/route-index.json"), "utf8"),
    ]);
    summary = parseOutputFiles(nodesRaw, routeIndexRaw);
  }

  return {
    summary,
    sourceFiles,
    outputFiles,
    stale: computeStaleState(sourceFiles, outputFiles),
  };
}

export async function compileAxisGraphToDisk() {
  const sourceFiles = await Promise.all(
    GRAPH_SOURCE_FILES.map((relativePath) => describeJsonFile(relativePath)),
  );
  const invalidSource = sourceFiles.find((file) => file.validJson === false || !file.exists);

  if (invalidSource) {
    throw new Error(
      `Graph source check failed for ${invalidSource.path}: ${invalidSource.error ?? "Invalid input."}`,
    );
  }

  const startedAt = Date.now();
  const { nodesFile, routeIndexFile } = buildAxisGraphFiles();

  await mkdir(GRAPH_OUTPUT_DIR, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(GRAPH_OUTPUT_DIR, "nodes.json"),
      `${JSON.stringify(nodesFile, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      path.join(GRAPH_OUTPUT_DIR, "route-index.json"),
      `${JSON.stringify(routeIndexFile, null, 2)}\n`,
      "utf8",
    ),
  ]);

  return {
    durationMs: Date.now() - startedAt,
    summary: createGraphSummary(nodesFile, routeIndexFile),
    state: await readGraphHqState(),
  };
}
