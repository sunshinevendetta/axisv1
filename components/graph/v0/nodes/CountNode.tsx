import { NC } from "../data/mock";
import type { GraphNode } from "../types";

interface Props {
  node: GraphNode;
  hovered?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function CountNode({ node, hovered, dimmed, onClick, onMouseEnter, onMouseLeave }: Props) {
  const c = NC[node.type] || NC.artist;
  return (
    <g transform={`translate(${node.x},${node.y})`}
      style={{ opacity: dimmed ? 0.13 : 1, cursor: "pointer", transition: "opacity .22s ease" }}
      onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <circle r={17} fill={c.fill} stroke={c.glow} strokeWidth={1.4}
        style={{ filter: `drop-shadow(0 0 ${hovered ? 16 : 6}px ${c.glow})` }} />
      <text textAnchor="middle" dominantBaseline="central" fill={c.glow} fontSize={9.5}
        fontFamily="'JetBrains Mono', monospace" fontWeight={700}>+{node.count}</text>
    </g>
  );
}
