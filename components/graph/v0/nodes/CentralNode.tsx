import { NC } from "../data/mock";
import type { GraphNode } from "../types";

interface Props {
  node: GraphNode;
  hovered?: boolean;
  selected?: boolean;
  glow?: number;
}

export default function CentralNode({ node, hovered, selected, glow }: Props) {
  const c = NC[node.type] || NC.artist;
  const gl = glow || (hovered || selected ? 22 : 10);
  return (
    <g transform={`translate(${node.x},${node.y})`} style={{ cursor: "pointer" }}>
      <circle r={node.r + 10} fill="none" stroke={c.glow} strokeWidth={1.2}
        strokeOpacity={selected ? 0.9 : 0.45} style={{ filter: `drop-shadow(0 0 ${gl}px ${c.glow})` }} />
      <circle r={node.r + 4} fill="none" stroke={c.stroke} strokeWidth={1.8} strokeOpacity={0.7} />
      <circle r={node.r + 10} fill="none" stroke={c.glow} strokeWidth={0.5} strokeOpacity={0.2} className="pulse-anim" />
      <circle r={node.r} fill={c.fill} />
      <text textAnchor="middle" dominantBaseline="central" fill={c.glow} fontSize={20}
        fontFamily="'Barlow Condensed', sans-serif" fontWeight={700}>{node.label?.slice(0, 2)}</text>
      <text y={node.r + 16} textAnchor="middle" fill="#E8EDF8" fontSize={12}
        fontFamily="'Barlow Condensed', sans-serif" fontWeight={700} letterSpacing=".1em">{node.label}</text>
      {node.sublabel && (
        <text y={node.r + 27} textAnchor="middle" fill={c.glow} fontSize={8.5}
          fontFamily="'Barlow Condensed', sans-serif" fontWeight={500} letterSpacing=".14em">{node.sublabel.toUpperCase()}</text>
      )}
    </g>
  );
}
