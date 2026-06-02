"use client";

import { useMemo, useState } from "react";
import { TC } from "./data/mock";
import type { NodeType } from "./types";

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];
const WEEKS = 53;
const DAYS = 7;

const PLATFORM_COLOR: Record<string, string> = {
  youtube: "#7A8BAA",
  soundcloud: "#7A8BAA",
  spotify: "#C8D4F0",
  mixcloud: "#7A8BAA",
  bandcamp: "#C8D4F0",
  beatport: "#7A8BAA",
};

function genActivity(year: number, week: number, day: number) {
  const seed = year * 1000 + week * 10 + day;
  const v = ((seed * 2654435761) >>> 0) % 100;
  const boost = year >= 2022 && year <= 2024 ? 1.4 : year === 2025 ? 1.1 : 0.7;
  return Math.min(1, (v / 100) * boost);
}

interface Props {
  activePlatform: string | null;
  mode?: "compact" | "full";
}

export default function ActivityHeatmap({ activePlatform, mode = "compact" }: Props) {
  const [hovCell, setHovCell] = useState<[number, number, number] | null>(null);
  const baseColor = activePlatform ? PLATFORM_COLOR[activePlatform] : "#C8D4F0";

  const isFull = mode === "full";
  const cellW = isFull ? 14 : 9;
  const cellH = isFull ? 14 : 9;
  const gap = isFull ? 3 : 2;

  const legendTypes: [NodeType, string][] = [["event", "Events"], ["release", "Releases"], ["article", "Articles"]];

  const yearTotals = useMemo(() => {
    const totals: Record<number, { sum: number; active: number; max: number }> = {};
    for (const year of YEARS) {
      const weeksThisYear = year === 2026 ? 18 : WEEKS;
      let sum = 0;
      let active = 0;
      let max = 0;
      for (let wi = 0; wi < weeksThisYear; wi++) {
        for (let di = 0; di < DAYS; di++) {
          const v = genActivity(year, wi, di);
          sum += v;
          if (v > 0.05) active += 1;
          if (v > max) max = v;
        }
      }
      totals[year] = { sum, active, max };
    }
    return totals;
  }, []);

  const grid = (
    <div style={{ display: "flex", gap: isFull ? 22 : 16, alignItems: "flex-end", paddingBottom: 2, minWidth: "max-content" }}>
      {YEARS.map((year) => {
        const isPartial = year === 2026;
        const weeksThisYear = isPartial ? 18 : WEEKS;
        return (
          <div key={year}>
            <div style={{ fontFamily: "var(--fm)", fontSize: isFull ? 10 : 7.5, color: "var(--t4)", marginBottom: 4, letterSpacing: ".06em" }}>{year}</div>
            <div style={{ display: "flex", gap: `${gap}px` }}>
              {Array.from({ length: weeksThisYear }, (_, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: `${gap}px` }}>
                  {Array.from({ length: DAYS }, (_, di) => {
                    const v = genActivity(year, wi, di);
                    const alpha = v < 0.05 ? 0.06 : v < 0.2 ? 0.2 : v < 0.4 ? 0.38 : v < 0.6 ? 0.56 : v < 0.8 ? 0.75 : 0.95;
                    const isHov = hovCell && hovCell[0] === year && hovCell[1] === wi && hovCell[2] === di;
                    return (
                      <div key={di} className="heatmap-cell"
                        style={{
                          width: cellW, height: cellH,
                          background: v < 0.05 ? "#0E1220" : baseColor,
                          opacity: v < 0.05 ? 1 : alpha,
                          boxShadow: isHov && v > 0.05 ? `0 0 6px ${baseColor}` : undefined,
                          outline: isHov ? `1px solid ${baseColor}60` : undefined,
                        }}
                        onMouseEnter={() => setHovCell([year, wi, di])}
                        onMouseLeave={() => setHovCell(null)} />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (isFull) {
    return (
      <div className="heatmap-full">
        <div className="heatmap-full-hd">
          <div>
            <div style={{ fontFamily: "var(--fu)", fontSize: 11, fontWeight: 600, letterSpacing: ".2em", color: "var(--t1)" }}>ACTIVITY HEATMAP</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--t4)", marginTop: 4 }}>RELEASES · EVENTS · APPEARANCES</div>
          </div>
          <div className="heatmap-full-legend">
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontFamily: "var(--fu)", fontSize: 9, color: "var(--t4)" }}>LESS</span>
              {[0.06, 0.2, 0.38, 0.56, 0.75, 0.95].map((a, i) => (
                <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: a < 0.1 ? "#0E1220" : baseColor, opacity: a < 0.1 ? 1 : a }}></div>
              ))}
              <span style={{ fontFamily: "var(--fu)", fontSize: 9, color: "var(--t4)" }}>MORE</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {legendTypes.map(([t, l]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: TC[t] }}></div>
                  <span style={{ fontFamily: "var(--fu)", fontSize: 9, color: "var(--t4)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="heatmap-full-body">
          <div className="heatmap-full-grid">
            {grid}
          </div>
          <aside className="heatmap-full-side">
            <div className="heatmap-side-hd">YEAR TOTALS</div>
            {YEARS.map((year) => {
              const t = yearTotals[year];
              const maxSum = Math.max(...YEARS.map((y) => yearTotals[y].sum));
              const pct = Math.round((t.sum / maxSum) * 100);
              return (
                <div key={year} className="heatmap-year-row">
                  <span className="heatmap-year-label">{year}</span>
                  <div className="heatmap-year-bar">
                    <div className="heatmap-year-fill" style={{ width: `${pct}%`, background: baseColor }} />
                  </div>
                  <span className="heatmap-year-val">{Math.round(t.sum)}</span>
                  <span className="heatmap-year-active">{t.active}d</span>
                </div>
              );
            })}
            {hovCell && (
              <div className="heatmap-hover-info">
                <div style={{ fontFamily: "var(--fu)", fontSize: 9, color: "var(--t4)", letterSpacing: ".12em" }}>HOVER</div>
                <div style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--t1)", marginTop: 4 }}>
                  {hovCell[0]} · W{hovCell[1] + 1} · D{hovCell[2] + 1}
                </div>
                <div style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--t3)", marginTop: 2 }}>
                  intensity {(genActivity(hovCell[0], hovCell[1], hovCell[2]) * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="heatmap-bar">
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--fu)", fontSize: 8.5, fontWeight: 600, letterSpacing: ".16em", color: "var(--t3)", marginBottom: 4 }}>ACTIVITY HEATMAP</div>
        <div style={{ fontFamily: "var(--fm)", fontSize: 7.5, color: "var(--t4)" }}>RELEASES · EVENTS · APPEARANCES</div>
      </div>
      <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}>
        {grid}
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--fu)", fontSize: 7.5, color: "var(--t4)" }}>LESS</span>
          {[0.06, 0.2, 0.38, 0.56, 0.75, 0.95].map((a, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: 1.5, background: a < 0.1 ? "#0E1220" : baseColor, opacity: a < 0.1 ? 1 : a }}></div>
          ))}
          <span style={{ fontFamily: "var(--fu)", fontSize: 7.5, color: "var(--t4)" }}>MORE</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {legendTypes.map(([t, l]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: TC[t] }}></div>
              <span style={{ fontFamily: "var(--fu)", fontSize: 7.5, color: "var(--t4)" }}>  {l}</span>
            </div>
          ))}
        </div>
        {hovCell && <div style={{ fontFamily: "var(--fm)", fontSize: 7.5, color: "var(--t3)" }}>{hovCell[0]} W{hovCell[1] + 1}</div>}
      </div>
    </div>
  );
}
