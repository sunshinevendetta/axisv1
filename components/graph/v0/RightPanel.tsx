"use client";

import { Fragment } from "react";
import dynamic from "next/dynamic";
import Module from "./modules/Module";
import { useModule } from "./modules/ModuleContext";
import { ARTICLES, CITY_PLAY, COUNTRY_PLAYS, FEED_ITEMS, NC, TC, UPCOMING_EVENTS } from "./data/mock";

const WorldMap = dynamic(() => import("./WorldMap"), { ssr: false });

const PLATFORMS = [
  { key: "youtube", label: "YouTube", count: "76K subs", color: "#7A8BAA" },
  { key: "soundcloud", label: "SoundCloud", count: "89K followers", color: "#7A8BAA" },
  { key: "spotify", label: "Spotify", count: "412K listeners", color: "#C8D4F0" },
  { key: "mixcloud", label: "Mixcloud", count: "12K followers", color: "#7A8BAA" },
  { key: "bandcamp", label: "Bandcamp", count: "8.4K fans", color: "#C8D4F0" },
  { key: "beatport", label: "Beatport", count: "3.2K tracks", color: "#E8EDF8" },
];

const SENTIMENTS: [string, string, string][] = [
  ["76%", "#C8D4F0", "POSITIVE"],
  ["18%", "#C8D4F0", "NEUTRAL"],
  ["6%", "#7A8BAA", "NEGATIVE"],
];

const RIGHT_IDS = [
  "top-articles",
  "global-activity-map",
  "sentiment",
  "platforms",
  "upcoming-events",
  "live-feed",
];

export default function RightPanel() {
  const { getColumnOrder } = useModule();
  const slots: Record<string, React.ReactNode> = {
    "top-articles": (
      <Module id="top-articles" title="Top Articles" columnId="right">
        {ARTICLES.map((a, i) => (
          <div key={i} className="article-row">
            <div className="article-title">{a.title}</div>
            <div className="article-meta">{a.meta}</div>
          </div>
        ))}
      </Module>
    ),
    "global-activity-map": (
      <Module
        id="global-activity-map"
        title="Global Activity Map"
        columnId="right"
        expandedView={
          <WorldMap
            countryPlays={COUNTRY_PLAYS}
            mode="full"
            cityPlay={CITY_PLAY}
          />
        }
      >
        <div style={{ fontFamily: "var(--fu)", fontSize: 7.5, color: "var(--t4)", letterSpacing: ".08em", marginBottom: 6 }}>COUNTRIES PLAYED</div>
        <WorldMap countryPlays={COUNTRY_PLAYS} height={200} />
        <div style={{ marginTop: 9 }}>
          {CITY_PLAY.map((c) => (
            <div key={c.city} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontFamily: "var(--fu)", fontSize: 9, color: "var(--t3)", flex: 1 }}>{c.city}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 5, width: 80 }}>
                <div style={{ flex: 1, height: 2.5, background: "var(--b2)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${c.pct}%`, height: "100%", background: "#7A8BAA", boxShadow: "0 0 4px #7A8BAA70" }}></div>
                </div>
                <span style={{ fontFamily: "var(--fm)", fontSize: 8, color: "#7A8BAA", width: 20, textAlign: "right" }}>{c.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </Module>
    ),
    "sentiment": (
      <Module id="sentiment" title="Sentiment · Articles" columnId="right">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <svg width={50} height={50} viewBox="0 0 50 50">
            {(() => {
              const r = 18;
              const circ = 2 * Math.PI * r;
              const segs = [{ p: 0.76, c: "#C8D4F0" }, { p: 0.18, c: "#C8D4F0" }, { p: 0.06, c: "#7A8BAA" }];
              let off = 0;
              return segs.map((s, i) => {
                const dash = s.p * circ;
                const gap = circ - dash;
                const el = (
                  <circle key={i} cx={25} cy={25} r={r} fill="none" stroke={s.c} strokeWidth={7}
                    strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-off} transform="rotate(-90 25 25)" strokeOpacity={0.9} />
                );
                off += dash;
                return el;
              });
            })()}
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {SENTIMENTS.map(([v, c, l]) => (
              <div key={l} style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: c }}></div>
                <span style={{ fontFamily: "var(--fm)", fontSize: 10, fontWeight: 700, color: c }}>{v}</span>
                <span style={{ fontFamily: "var(--fu)", fontSize: 8.5, color: "var(--t4)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </Module>
    ),
    "platforms": (
      <Module id="platforms" title="Platforms" columnId="right">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {PLATFORMS.map((p) => (
            <div key={p.key}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "5px 8px",
                borderRadius: 2, cursor: "pointer", border: `1px solid var(--b1)`,
                transition: "border-color .15s,background .15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.background = "#0A0D14"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--b1)"; e.currentTarget.style.background = "transparent"; }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, boxShadow: `0 0 5px ${p.color}`, flexShrink: 0 }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--fu)", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", color: "var(--t2)", textTransform: "uppercase" }}>{p.label}</div>
                <div style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--t4)", marginTop: 1 }}>{p.count}</div>
              </div>
              <span style={{ fontFamily: "var(--fu)", fontSize: 8, color: p.color, letterSpacing: ".1em" }}>↗</span>
            </div>
          ))}
        </div>
      </Module>
    ),
    "upcoming-events": (
      <Module id="upcoming-events" title="Upcoming Events" columnId="right">
        {UPCOMING_EVENTS.map((e, i) => (
          <div key={i} className="event-row">
            <div style={{
              width: 32, height: 32, borderRadius: 2, background: NC.event.fill, border: "1px solid #7A8BAA", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fu)", fontSize: 9, fontWeight: 700, color: "#7A8BAA",
            }}>EV</div>
            <div>
              <div className="event-name">{e.name}</div>
              <div className="event-meta">{e.detail}</div>
            </div>
          </div>
        ))}
      </Module>
    ),
    "live-feed": (
      <Module id="live-feed" title="Feed · Live" columnId="right">
        {FEED_ITEMS.map((f, i) => (
          <div key={i} className="feed-row">
            <span style={{ fontFamily: "var(--fm)", fontSize: 8.5, color: "var(--t4)", flexShrink: 0, paddingTop: 1 }}>{f.time}</span>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: TC[f.type], boxShadow: `0 0 4px ${TC[f.type]}`, flexShrink: 0, marginTop: 3 }}></div>
            <span style={{ fontFamily: "var(--fu)", fontSize: 9.5, color: "#4A6080", lineHeight: 1.4 }}>{f.text}</span>
          </div>
        ))}
      </Module>
    ),
  };
  const order = getColumnOrder("right", RIGHT_IDS);
  return (
    <div className="col-right">
      {order.map((id) => (
        <Fragment key={id}>{slots[id]}</Fragment>
      ))}
    </div>
  );
}
