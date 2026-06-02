import { NC } from "../data/mock";
import type { GraphEdge, GraphNode } from "../types";

interface Props {
  edges: GraphEdge[];
  nodes: GraphNode[];
  hoveredId: string | null;
  selectedId: string | null;
  curveFactor?: number;
}

export default function EdgeLayer({ edges, nodes, hoveredId, selectedId, curveFactor }: Props) {
  return (
    <g>
      {edges.map((e, i) => {
        const fr = nodes.find((n) => n.id === e.from);
        const to = nodes.find((n) => n.id === e.to);
        if (!fr || !to) return null;
        const ref = hoveredId || selectedId;
        const isConn = ref ? (e.from === ref || e.to === ref) : true;
        const opacity = ref ? (isConn ? 0.88 : 0.04) : 0.4;
        const dx = to.x - fr.x, dy = to.y - fr.y;
        const mx = (fr.x + to.x) / 2, my = (fr.y + to.y) / 2;
        const cf = curveFactor ?? 0.25;
        const cpx = mx - dy * cf, cpy = my + dx * cf;
        const pathD = `M ${fr.x} ${fr.y} Q ${cpx} ${cpy} ${to.x} ${to.y}`;
        const ec = NC[to.type]?.glow || "#4455AA";
        const lx = 0.25 * fr.x + 0.5 * cpx + 0.25 * to.x;
        const ly = 0.25 * fr.y + 0.5 * cpy + 0.25 * to.y;
        return (
          <g key={i} style={{ opacity, transition: "opacity .25s ease" }}>
            <path d={pathD} fill="none" stroke={ec} strokeWidth={isConn ? 1.4 : 0.7}
              strokeDasharray={e.inferred ? "4 4" : undefined} strokeOpacity={0.65} />
            {e.label && isConn && ref && (
              <text x={lx} y={ly - 5} textAnchor="middle" fill={ec} fontSize={7.5}
                fontFamily="'Barlow Condensed', sans-serif" fontWeight={500} letterSpacing=".06em" fillOpacity={0.9}>
                {e.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
