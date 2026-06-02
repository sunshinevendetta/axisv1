"use client";

import { useState } from "react";
import ActivityHeatmap from "./ActivityHeatmap";
import GraphColumn from "./GraphColumn";
import LeftPanel from "./LeftPanel";
import PlatformBar from "./PlatformBar";
import RightPanel from "./RightPanel";
import TopBar from "./TopBar";
import TweaksOverlay from "./TweaksOverlay";
import BottomPanels from "./panels/BottomPanels";
import Module from "./modules/Module";
import { ModuleProvider, useModule } from "./modules/ModuleContext";
import ModuleHost from "./modules/ModuleHost";
import { EDGES, NODES, TWEAK_DEFAULTS } from "./data/mock";
import { useTweaks } from "./useTweaks";
import type { FilterKey } from "./types";
import "./graph.css";

const ALL_FILTERS: FilterKey[] = ["artist", "genre", "event", "release", "article", "label"];

export default function AxisGraphClient() {
  const [activeNav, setActiveNav] = useState("DASHBOARD");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>(ALL_FILTERS);
  const [svgOffset, setSvgOffset] = useState({ x: 320, y: 260 });
  const [zoom, setZoom] = useState(1);
  const [depth, setDepth] = useState(2);
  const [showTweaks, setShowTweaks] = useState(false);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const { tweaks, setTweak } = useTweaks(TWEAK_DEFAULTS);

  const toggleFilter = (key: FilterKey) =>
    setActiveFilters((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <ModuleProvider>
      <div className="axis-graph-v0">
        <TopBar activeNav={activeNav} setActiveNav={setActiveNav} />
        <PlatformBar activePlatform={activePlatform} setActivePlatform={setActivePlatform} />
        <div className="main-layout">
          <LeftPanel activeFilters={activeFilters} toggleFilter={toggleFilter} />
          <div className="col-center">
            <Module id="artist-intel-map" title="Artist Intel Map" bare columnId="center">
              <GraphColumn
                nodes={NODES} edges={EDGES}
                hoveredId={hoveredId} selectedId={selectedId}
                setHoveredId={setHoveredId}
                setSelectedId={setSelectedId}
                activeFilters={activeFilters}
                svgOffset={svgOffset} setSvgOffset={setSvgOffset}
                zoom={zoom} setZoom={setZoom}
                depth={depth} setDepth={setDepth}
                tweaks={tweaks}
              />
            </Module>
            <BottomPanels />
          </div>
          <RightPanel />
        </div>
        <Module
          id="activity-heatmap"
          title="Activity Heatmap"
          bare
          columnId="footer"
          expandedView={<ActivityHeatmap activePlatform={activePlatform} mode="full" />}
        >
          <ActivityHeatmap activePlatform={activePlatform} />
        </Module>
        <div style={{ position: "fixed", left: 16, bottom: 16, zIndex: 9998, display: "flex", gap: 6 }}>
          <button
            onClick={() => setShowTweaks((v) => !v)}
            style={{
              background: "#0A0D14", color: "#4A5878", border: "1px solid #1C2235", borderRadius: 3,
              padding: "6px 12px", fontFamily: "var(--fu)", fontSize: 9, letterSpacing: ".14em",
              textTransform: "uppercase", cursor: "pointer",
            }}>
            {showTweaks ? "Hide tweaks" : "Tweaks"}
          </button>
          <ResetLayoutButton />
        </div>
        {showTweaks && (
          <TweaksOverlay tweaks={tweaks} setTweak={setTweak} onClose={() => setShowTweaks(false)} />
        )}
        <ModuleHost />
      </div>
    </ModuleProvider>
  );
}

function ResetLayoutButton() {
  const { resetLayout } = useModule();
  return (
    <button
      onClick={() => {
        resetLayout();
        if (typeof window !== "undefined") window.location.reload();
      }}
      title="Clear stored module sizes and collapsed state"
      style={{
        background: "#0A0D14", color: "#4A5878", border: "1px solid #1C2235", borderRadius: 3,
        padding: "6px 12px", fontFamily: "var(--fu)", fontSize: 9, letterSpacing: ".14em",
        textTransform: "uppercase", cursor: "pointer",
      }}>
      Reset layout
    </button>
  );
}
