"use client";

import PillNav from "@/components/PillNav";
import { publicNavItems } from "@/src/lib/navigation";

interface Props {
  /** Unused now — kept for backwards-compat with AxisGraphClient props. */
  activeNav?: string;
  setActiveNav?: (n: string) => void;
}

export default function TopBar({}: Props) {
  return (
    <div className="topbar">
      <div className="topbar-pill">
        <PillNav
          logo="/logo.png"
          logoAlt="AXIS"
          items={publicNavItems}
          activeHref="/graph/v0"
          baseColor="#07090D"
          pillColor="#E8EDF8"
          pillTextColor="#07090D"
          hoveredPillTextColor="#07090D"
          initialLoadAnimation={false}
        />
      </div>
      <div className="topbar-right">
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--t3)", letterSpacing: ".06em" }}>USER: ANALYST_01 ●</div>
          <div style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--t4)", letterSpacing: ".06em" }}>UTC 2026.05.13 · GRAPH V0</div>
        </div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 7px var(--accent)" }}></div>
      </div>
    </div>
  );
}
