"use client";

const PLATFORMS = [
  { key: "youtube", label: "YouTube", stat: "76K", unit: "SUBS", color: "#7A8BAA" },
  { key: "soundcloud", label: "SoundCloud", stat: "89K", unit: "FOLLOWERS", color: "#7A8BAA" },
  { key: "spotify", label: "Spotify", stat: "412K", unit: "LISTENERS", color: "#C8D4F0" },
  { key: "mixcloud", label: "Mixcloud", stat: "12K", unit: "FOLLOWERS", color: "#7A8BAA" },
  { key: "bandcamp", label: "Bandcamp", stat: "8.4K", unit: "FANS", color: "#C8D4F0" },
  { key: "beatport", label: "Beatport", stat: "3.2K", unit: "TRACKS", color: "#7A8BAA" },
];

interface Props {
  activePlatform: string | null;
  setActivePlatform: (p: string | null) => void;
}

export default function PlatformBar({ activePlatform, setActivePlatform }: Props) {
  return (
    <div className="platform-bar">
      {PLATFORMS.map((p) => {
        const active = activePlatform === p.key;
        return (
          <div key={p.key} className={`platform-btn${active ? " active" : ""}`}
            style={{ borderTopColor: active ? p.color : "transparent" }}
            onClick={() => setActivePlatform(active ? null : p.key)}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%", background: active ? p.color : "var(--b2)",
              boxShadow: active ? `0 0 7px ${p.color}` : undefined, flexShrink: 0, transition: "background .15s,box-shadow .15s",
            }}></div>
            <div>
              <div className="platform-btn-label" style={{ color: active ? p.color : undefined }}>{p.label}</div>
              <div className="platform-btn-count">{p.stat} {p.unit}</div>
            </div>
          </div>
        );
      })}
      <div style={{ flex: 1 }}></div>
      <div style={{ display: "flex", alignItems: "center", padding: "0 14px", gap: 8, borderLeft: "1px solid var(--b1)" }}>
        <span style={{ fontFamily: "var(--fu)", fontSize: 8, color: "var(--t4)", letterSpacing: ".1em" }}>CLICK TO FILTER HEATMAP</span>
      </div>
    </div>
  );
}
