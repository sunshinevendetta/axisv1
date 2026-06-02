import { NC } from "../data/mock";
import type { GraphNode } from "../types";

interface Props {
  node: GraphNode;
  hovered?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  glow?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function OuterNode({ node, hovered, selected, dimmed, onClick, onMouseEnter, onMouseLeave, glow }: Props) {
  const c = NC[node.type] || NC.artist;
  const gl = glow || (hovered ? 14 : selected ? 9 : 4);
  return (
    <g transform={`translate(${node.x},${node.y})`}
      style={{ opacity: dimmed ? 0.13 : 1, cursor: "pointer", transition: "opacity .22s ease" }}
      onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <circle r={node.r} fill={c.fill} stroke={c.stroke} strokeWidth={1.1}
        style={{ filter: `drop-shadow(0 0 ${gl}px ${c.glow})`, transition: "filter .18s" }} />
      <text textAnchor="middle" dominantBaseline="central" fill={c.glow} fontSize={9}
        fontFamily="'Barlow Condensed', sans-serif" fontWeight={700}>{node.label?.slice(0, 2).toUpperCase()}</text>
      <text y={node.r + 12} textAnchor="middle" fill={hovered ? "#E8EDF8" : "#7A8BAA"} fontSize={8.5}
        fontFamily="'Barlow Condensed', sans-serif" fontWeight={500} letterSpacing=".05em"
        style={{ transition: "fill .15s" }}>{node.label}</text>
    </g>
  );
}
