"use client";

import { Fragment } from "react";
import Module from "./modules/Module";
import { useModule } from "./modules/ModuleContext";
import { NODE_FILTERS, SPARK, TOP_TRACKS } from "./data/mock";
import type { FilterKey } from "./types";

interface Props {
  activeFilters: FilterKey[];
  toggleFilter: (key: FilterKey) => void;
}

const SOCIAL = [
  { p: "Instagram", v: "128K", d: "+2.4%" },
  { p: "Spotify", v: "412K", d: "+4.1%" },
  { p: "SoundCloud", v: "89K", d: "+1.7%" },
  { p: "YouTube", v: "76K", d: "+3.2%" },
  { p: "X (Twitter)", v: "54K", d: "+0.8%" },
];

const GENRE_INFLUENCE = [
  { name: "Industrial Techno", pct: 68, c: "#7A8BAA" },
  { name: "Raw Techno", pct: 52, c: "#7A8BAA" },
  { name: "Dark Techno", pct: 47, c: "#7A8BAA" },
  { name: "Hypnotic Techno", pct: 41, c: "#7A8BAA" },
  { name: "Ambient", pct: 19, c: "#7A8BAA" },
];

const LEFT_IDS = ["artist-card", "social-media", "music-catalog", "filter-nodes", "genre-influence"];

export default function LeftPanel({ activeFilters, toggleFilter }: Props) {
  const { getColumnOrder } = useModule();
  const slots: Record<string, React.ReactNode> = {
    "artist-card": (
      <Module id="artist-card" title="Artist · Blawan" columnId="left">
        <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "#1C2235", border: "1.5px solid #C8D4F0",
            boxShadow: "0 0 12px #C8D4F044", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--fu)", fontSize: 13, fontWeight: 700, color: "#C8D4F0",
          }}>BL</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "var(--fu)", fontSize: 13, fontWeight: 700, letterSpacing: ".08em", color: "#E8EDF8", lineHeight: 1.1 }}>BLAWAN</span>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7A8BAA", boxShadow: "0 0 6px #7A8BAA", display: "inline-block" }}></span>
            </div>
            <div style={{ display: "inline-block", background: "#1C2235", color: "#C8D4F0", fontFamily: "var(--fu)", fontSize: 7.5, fontWeight: 700, letterSpacing: ".14em", padding: "1px 5px", borderRadius: 2, marginTop: 2 }}>ARTIST</div>
            <div style={{ fontFamily: "var(--fu)", fontSize: 8.5, color: "#3A4870", marginTop: 4, lineHeight: 1.7 }}>
              London, UK<br />RA: 15432 &nbsp;·&nbsp; BC: blawan
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span className="pt">REPUTATION SCORE</span>
              <span style={{ fontFamily: "var(--fm)", fontSize: 9, color: "#C8D4F0", fontWeight: 700 }}>88 / 100</span>
            </div>
            <div className="score-track">
              <div className="score-fill" style={{ width: "88%", background: "#C8D4F0", boxShadow: "0 0 5px #C8D4F0" }}></div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="pt">ACTIVITY LEVEL</span>
            <span style={{ fontFamily: "var(--fu)", fontSize: 9, fontWeight: 700, letterSpacing: ".14em", color: "#C8D4F0" }}>HIGH</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 16, marginTop: 2 }}>
            {SPARK.map((v, i) => (
              <div key={i} className="spark-bar" style={{ height: `${(v / 20) * 100}%`, background: i > 10 ? "#C8D4F0" : "#1C2235" }}></div>
            ))}
          </div>
        </div>
      </Module>
    ),
    "social-media": (
      <Module id="social-media" title="Social Media" columnId="left">
        {SOCIAL.map((s) => (
          <div key={s.p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2.5px 0", borderBottom: "1px solid #0A0D14" }}>
            <span style={{ fontFamily: "var(--fu)", fontSize: 9.5, color: "#4A5878" }}>{s.p}</span>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--fm)", fontSize: 9.5, color: "#A8B8D8", fontWeight: 600 }}>{s.v}</span>
              <span style={{ fontFamily: "var(--fm)", fontSize: 7.5, color: "#C8D4F0" }}>{s.d}</span>
            </div>
          </div>
        ))}
      </Module>
    ),
    "music-catalog": (
      <Module id="music-catalog" title="Music Catalog" columnId="left">
        <div style={{ fontFamily: "var(--fu)", fontSize: 8.5, color: "var(--t3)", letterSpacing: ".1em", marginBottom: 5 }}>TOP TRACKS</div>
        {TOP_TRACKS.map((t, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: "1px solid #0A0D14", cursor: "pointer" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", minWidth: 0 }}>
              <span style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--t4)", flexShrink: 0, width: 12 }}>{i + 1}.</span>
              <span style={{ fontFamily: "var(--fu)", fontSize: 9.5, color: "#5A6880", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
            </div>
            <span style={{ fontFamily: "var(--fm)", fontSize: 8.5, color: "var(--t4)", flexShrink: 0, marginLeft: 4 }}>{t.dur}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 8, paddingTop: 6, borderTop: "1px solid #111824" }}>
          <button style={{ flex: 1, fontFamily: "var(--fu)", fontSize: 9, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--t3)", background: "transparent", border: "1px solid var(--b2)", borderRadius: 2, padding: "4px 0", cursor: "pointer" }}>VIEW FULL DISCOGRAPHY</button>
        </div>
      </Module>
    ),
    "filter-nodes": (
      <Module id="filter-nodes" title="Filter Nodes" columnId="left">
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {NODE_FILTERS.map((f) => {
            const on = activeFilters.includes(f.key);
            return (
              <div key={f.key} className="filter-pill"
                style={{ borderColor: on ? f.color + "70" : "var(--b2)", color: on ? "#D0DCF0" : "var(--t4)", boxShadow: on ? `0 0 7px ${f.color}25` : undefined }}
                onClick={() => toggleFilter(f.key)}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: on ? f.color : "var(--b2)", boxShadow: on ? `0 0 5px ${f.color}` : undefined, flexShrink: 0 }}></div>
                {f.label}
                <span style={{ marginLeft: "auto", fontFamily: "var(--fm)", fontSize: 8, color: on ? f.color : "var(--t4)" }}>{on ? "●" : "○"}</span>
              </div>
            );
          })}
        </div>
      </Module>
    ),
    "genre-influence": (
      <Module id="genre-influence" title="Genre Influence" columnId="left">
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <svg width={44} height={44} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
            {(() => {
              const r = 17;
              const circ = 2 * Math.PI * r;
              const p = 0.68;
              return (
                <g>
                  <circle cx={22} cy={22} r={r} fill="none" stroke="#111824" strokeWidth={6} />
                  <circle cx={22} cy={22} r={r} fill="none" stroke="#7A8BAA" strokeWidth={6}
                    strokeDasharray={`${p * circ} ${circ}`} strokeDashoffset={0}
                    transform="rotate(-90 22 22)" strokeOpacity={0.9} />
                </g>
              );
            })()}
            <text textAnchor="middle" dominantBaseline="central" x={22} y={22}
              fill="#7A8BAA" fontSize={8} fontFamily="'JetBrains Mono', monospace" fontWeight={700}>68%</text>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--fu)", fontSize: 8.5, color: "var(--t3)", letterSpacing: ".1em", marginBottom: 4 }}>PRIMARY GENRES</div>
          </div>
        </div>
        {GENRE_INFLUENCE.map((g) => (
          <div key={g.name} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontFamily: "var(--fu)", fontSize: 9, color: "#5A6880" }}>{g.name}</span>
              <span style={{ fontFamily: "var(--fm)", fontSize: 8.5, color: g.c, fontWeight: 600 }}>{g.pct}%</span>
            </div>
            <div className="score-track"><div className="score-fill" style={{ width: `${g.pct}%`, background: g.c, boxShadow: `0 0 3px ${g.c}70` }}></div></div>
          </div>
        ))}
      </Module>
    ),
  };
  const order = getColumnOrder("left", LEFT_IDS);
  return (
    <div className="col-left">
      {order.map((id) => (
        <Fragment key={id}>{slots[id]}</Fragment>
      ))}
    </div>
  );
}
