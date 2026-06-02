export type NodeType = "artist" | "genre" | "article" | "event" | "release" | "label";

export interface GraphNode {
  id: string;
  type: NodeType;
  label?: string;
  sublabel?: string;
  meta?: string;
  x: number;
  y: number;
  r: number;
  central?: boolean;
  count?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  inferred?: boolean;
}

export interface NodeColor {
  fill: string;
  stroke: string;
  glow: string;
}

export interface Tweaks {
  accentArtist: string;
  accentGenre: string;
  accentEvent: string;
  accentRelease: string;
  accentArticle: string;
  edgeCurve: number;
  nodeGlow: number;
  showGrid: boolean;
  layout: string;
}

export interface NodeFilter {
  key: NodeType;
  label: string;
  color: string;
}

export type FilterKey = NodeType;
