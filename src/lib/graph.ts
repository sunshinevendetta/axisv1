import rawNodes from "@/content/graph/nodes.json";
import rawRouteIndex from "@/content/graph/route-index.json";
import type {
  AxisGraph,
  AxisGraphNode,
  AxisGraphNodeType,
  AxisNodesFile,
  AxisRouteIndexFile,
} from "@/src/types/graph";

const nodesFile = rawNodes as AxisNodesFile;
const routeIndex = rawRouteIndex as AxisRouteIndexFile;

export const axisGraph: AxisGraph = {
  version: nodesFile.version,
  generatedAt: nodesFile.generatedAt,
  site: nodesFile.site,
  nodes: nodesFile.nodes,
  routes: routeIndex.routes,
  canonical: routeIndex.canonical,
};

export function getAxisNodeById(id: string): AxisGraphNode | null {
  return axisGraph.nodes[id] ?? null;
}

export function getAxisNodeBySlug(slug: string): AxisGraphNode | null {
  return (
    Object.values(axisGraph.nodes).find((node) => node.slug === slug) ?? null
  );
}

export function getAxisNodeByRoute(route: string): AxisGraphNode | null {
  const id = axisGraph.routes[route];
  return id ? getAxisNodeById(id) : null;
}

export function getAxisCanonicalRoute(id: string): string | null {
  return axisGraph.canonical[id] ?? null;
}

export function getAxisNodesByType(type: AxisGraphNodeType): AxisGraphNode[] {
  return Object.values(axisGraph.nodes).filter((node) => node.type === type);
}
