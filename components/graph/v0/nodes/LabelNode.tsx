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

export default function LabelNode({ node, hovered, selected, dimmed, onClick, onMouseEnter, onMouseLeave, glow }: Props) {
  const c = NC.label;
  const gl = glow || (hovered ? 14 : selected ? 9 : 4);
  const r = node.r;
  const pts = `0,${-r} ${r},0 0,${r} ${-r},0`;
  return (
    <g transform={`translate(${node.x},${node.y})`}
      style={{ opacity: dimmed ? 0.13 : 1, cursor: "pointer", transition: "opacity .22s ease" }}
      onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <polygon points={pts} fill={c.fill} stroke={c.stroke} strokeWidth={1.2}
        style={{ filter: `drop-shadow(0 0 ${gl}px ${c.glow})`, transition: "filter .18s" }} />
      <text textAnchor="middle" dominantBaseline="central" fill={c.glow} fontSize={8}
        fontFamily="'Barlow Condensed', sans-serif" fontWeight={700} letterSpacing=".04em">
        {node.label?.slice(0, 3).toUpperCase()}
      </text>
      <text y={r + 13} textAnchor="middle"
        fill={hovered ? "#E8EDF8" : "#7A8BAA"} fontSize={8.5}
        fontFamily="'Barlow Condensed', sans-serif" fontWeight={500} letterSpacing=".05em"
        style={{ transition: "fill .15s" }}>{node.label}</text>
    </g>
  );
}
