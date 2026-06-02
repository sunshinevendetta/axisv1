"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NC, NODE_DEPTH, NODES } from "./data/mock";
import CentralNode from "./nodes/CentralNode";
import CountNode from "./nodes/CountNode";
import EdgeLayer from "./nodes/EdgeLayer";
import LabelNode from "./nodes/LabelNode";
import OuterNode from "./nodes/OuterNode";
import type { FilterKey, GraphEdge, GraphNode, Tweaks } from "./types";

import type { Dispatch, SetStateAction } from "react";

interface Offset { x: number; y: number; }

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  hoveredId: string | null;
  selectedId: string | null;
  setHoveredId: Dispatch<SetStateAction<string | null>>;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  activeFilters: FilterKey[];
  svgOffset: Offset;
  setSvgOffset: Dispatch<SetStateAction<Offset>>;
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
  depth: number;
  setDepth: Dispatch<SetStateAction<number>>;
  tweaks: Tweaks;
}

export default function GraphColumn({
  nodes, edges, hoveredId, selectedId, setHoveredId, setSelectedId,
  activeFilters, svgOffset, setSvgOffset, zoom, setZoom, depth, setDepth, tweaks,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const offRef = useRef<Offset>(svgOffset);
  const zoomRef = useRef<number>(zoom);
  useEffect(() => { offRef.current = svgOffset; }, [svgOffset]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const onDown = (e: React.MouseEvent) => {
    if ((e.target as Element).closest("[data-node]")) return;
    setDragging(true);
    dragRef.current = { x: e.clientX - offRef.current.x, y: e.clientY - offRef.current.y };
  };
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !dragRef.current) return;
    setSvgOffset({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y });
  }, [dragging, setSvgOffset]);
  const onUp = () => { setDragging(false); dragRef.current = null; };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.92 : 1.09;
    const newZoom = Math.min(4, Math.max(0.2, zoomRef.current * delta));
    const scale = newZoom / zoomRef.current;
    setSvgOffset((prev) => ({
      x: mx - (mx - prev.x) * scale,
      y: my - (my - prev.y) * scale,
    }));
    setZoom(newZoom);
  }, [setSvgOffset, setZoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const vis = useMemo(() => nodes.filter((n) => {
    if (n.central) return true;
    const nd = NODE_DEPTH[n.id] || 2;
    if (nd > depth) return false;
    if (n.count !== undefined) return depth >= 3;
    return activeFilters.includes(n.type);
  }), [nodes, activeFilters, depth]);

  const visEdges = useMemo(() => edges.filter((e) => {
    const fn = vis.find((n) => n.id === e.from);
    const tn = vis.find((n) => n.id === e.to);
    return fn && tn;
  }), [edges, vis]);

  const isConn = (nid: string, ref: string | null) =>
    !!ref && edges.some((e) => (e.from === ref && e.to === nid) || (e.to === ref && e.from === nid));

  const zoomBy = (factor: number) => {
    const nz = Math.min(4, Math.max(0.2, zoom * factor));
    const cx = containerRef.current?.offsetWidth ? containerRef.current.offsetWidth / 2 : 400;
    const cy = containerRef.current?.offsetHeight ? containerRef.current.offsetHeight / 2 : 300;
    const scale = nz / zoom;
    setSvgOffset((p) => ({ x: cx - (cx - p.x) * scale, y: cy - (cy - p.y) * scale }));
    setZoom(nz);
  };

  return (
    <div ref={containerRef} className={`center-graph${tweaks.showGrid ? " graph-bg" : ""}`}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
      onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
      <div style={{ position: "absolute", top: 10, left: 12, pointerEvents: "none", userSelect: "none" }}>
        <div style={{ fontFamily: "var(--fu)", fontSize: 9, fontWeight: 600, letterSpacing: ".16em", color: "var(--t3)" }}>ARTIST INTEL MAP</div>
        <div style={{ fontFamily: "var(--fu)", fontSize: 7.5, color: "var(--t4)", letterSpacing: ".1em", marginTop: 1 }}>RELATIONSHIP &amp; INFLUENCE NETWORK</div>
      </div>
      <svg width="100%" height="100%">
        <g transform={`translate(${svgOffset.x},${svgOffset.y}) scale(${zoom})`}>
          <EdgeLayer edges={visEdges} nodes={vis} hoveredId={hoveredId} selectedId={selectedId} curveFactor={tweaks.edgeCurve} />
          {vis.map((node) => {
            if (node.central) return (
              <g key={node.id} data-node="1"
                onClick={() => setSelectedId((id) => id === node.id ? null : node.id)}
                onMouseEnter={() => setHoveredId(node.id)} onMouseLeave={() => setHoveredId(null)}>
                <CentralNode node={node} hovered={hoveredId === node.id} selected={selectedId === node.id} glow={tweaks.nodeGlow} />
              </g>
            );
            if (node.count !== undefined) {
              const ref = hoveredId || selectedId;
              const dim = ref ? (!isConn(node.id, ref) && ref !== node.id) : false;
              return (
                <g key={node.id} data-node="1">
                  <CountNode node={node} hovered={hoveredId === node.id} dimmed={dim}
                    onClick={() => setSelectedId((id) => id === node.id ? null : node.id)}
                    onMouseEnter={() => setHoveredId(node.id)} onMouseLeave={() => setHoveredId(null)} />
                </g>
              );
            }
            const ref = hoveredId || selectedId;
            const dim = ref ? (ref !== node.id && !isConn(node.id, ref)) : false;
            const shared = {
              node,
              hovered: hoveredId === node.id,
              selected: selectedId === node.id,
              dimmed: dim,
              glow: tweaks.nodeGlow,
              onClick: () => setSelectedId((id) => id === node.id ? null : node.id),
              onMouseEnter: () => setHoveredId(node.id),
              onMouseLeave: () => setHoveredId(null),
            };
            return (
              <g key={node.id} data-node="1">
                {node.type === "label" ? <LabelNode {...shared} /> : <OuterNode {...shared} />}
              </g>
            );
          })}
        </g>
      </svg>

      <div style={{ position: "absolute", bottom: 8, left: 10, fontFamily: "var(--fm)", fontSize: 7.5, color: "#1C2235", pointerEvents: "none", letterSpacing: ".06em" }}>
        X:{String(Math.round(-svgOffset.x)).padStart(5, " ")} Y:{String(Math.round(-svgOffset.y)).padStart(5, " ")} Z:{zoom.toFixed(2)}
      </div>

      <div style={{ position: "absolute", top: 10, right: 12, display: "flex", flexDirection: "column", gap: 6, zIndex: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", background: "#090C14", border: "1px solid #1C2235", borderRadius: 3, overflow: "hidden" }}>
          {[
            { label: "+", fn: () => zoomBy(1.25) },
            { label: "−", fn: () => zoomBy(0.8) },
            { label: "⌂", fn: () => { setZoom(1); setSvgOffset({ x: 320, y: 260 }); } },
          ].map(({ label, fn }) => (
            <button key={label} onClick={fn} style={{
              width: 28, height: 28, background: "transparent", border: "none", borderBottom: "1px solid #1C2235",
              color: "#4A5878", fontFamily: "var(--fm)", fontSize: label === "⌂" ? 13 : 16, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "color .15s,background .15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#131824"; e.currentTarget.style.color = "#E8EDF8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4A5878"; }}>
              {label}
            </button>
          ))}
          <div style={{ padding: "4px 0", textAlign: "center", fontFamily: "var(--fm)", fontSize: 7, color: "#2A3450" }}>
            {Math.round(zoom * 100)}%
          </div>
        </div>

        <div style={{ background: "#090C14", border: "1px solid #1C2235", borderRadius: 3, padding: "8px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontFamily: "var(--fu)", fontSize: 7.5, color: "#2A3450", letterSpacing: ".1em", marginBottom: 2 }}>DEPTH</div>
          {[{ v: 3, label: "MAX" }, { v: 2, label: "STD" }, { v: 1, label: "MIN" }].map((d) => (
            <button key={d.v}
              style={{
                width: 28, height: 22, background: depth === d.v ? "#1C2235" : "transparent",
                border: `1px solid ${depth === d.v ? "#2A3450" : "#131824"}`, borderRadius: 2,
                color: depth === d.v ? "#E8EDF8" : "#3A4560", fontFamily: "var(--fu)", fontSize: 8.5,
                fontWeight: 600, letterSpacing: ".06em", cursor: "pointer", transition: "all .15s",
              }}
              onMouseEnter={(e) => { if (depth !== d.v) { e.currentTarget.style.borderColor = "#2A3450"; e.currentTarget.style.color = "#7A8BAA"; } }}
              onMouseLeave={(e) => { if (depth !== d.v) { e.currentTarget.style.borderColor = "#131824"; e.currentTarget.style.color = "#3A4560"; } }}
              onClick={() => setDepth(d.v)}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 8, right: 10, display: "flex", gap: 12, pointerEvents: "none" }}>
        {([["DIRECT", undefined], ["INFERRED", "4 3"]] as const).map(([l, d]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width={18} height={5}><line x1={0} y1={2.5} x2={18} y2={2.5} stroke="#2A3450" strokeWidth={1.2} strokeDasharray={d} /></svg>
            <span style={{ fontFamily: "var(--fu)", fontSize: 8, color: "#2A3450", letterSpacing: ".1em" }}>{l}</span>
          </div>
        ))}
      </div>

      {hoveredId && (() => {
        const n = NODES.find((x) => x.id === hoveredId);
        if (!n || n.count !== undefined) return null;
        const c = NC[n.type] || NC.artist;
        return (
          <div style={{
            position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", background: "#090C12",
            border: `1px solid ${c.stroke}`, boxShadow: `0 0 12px ${c.glow}28`, padding: "4px 12px", borderRadius: 2,
            pointerEvents: "none", display: "flex", alignItems: "center", gap: 9,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: c.glow, boxShadow: `0 0 5px ${c.glow}` }}></div>
            <span style={{ fontFamily: "var(--fu)", fontSize: 10.5, fontWeight: 600, letterSpacing: ".1em", color: "#E8EDF8" }}>{n.label}</span>
            <span style={{ fontFamily: "var(--fu)", fontSize: 8.5, color: c.glow, letterSpacing: ".12em" }}>{n.type.toUpperCase()}</span>
            {n.meta && <span style={{ fontFamily: "var(--fm)", fontSize: 8.5, color: "#4A5878" }}>{n.meta}</span>}
          </div>
        );
      })()}
    </div>
  );
}
