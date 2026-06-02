const SOUND_FEATURES = [
  { l: "Energy", v: 8.7, c: "#7A8BAA" },
  { l: "Danceability", v: 6.2, c: "#7A8BAA" },
  { l: "Acousticness", v: 1.2, c: "#C8D4F0" },
  { l: "Valence", v: 5.3, c: "#7A8BAA" },
  { l: "Instrumentalness", v: 9.1, c: "#C8D4F0" },
  { l: "Liveness", v: 4.1, c: "#7A8BAA" },
];

export default function PanelSound() {
  return (
    <div className="bottom-panel">
      <div className="pt" style={{ marginBottom: 8 }}>SOUND INTEL · AUDIO FEATURES</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
        {SOUND_FEATURES.map((s) => (
          <div key={s.l} style={{ marginBottom: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontFamily: "var(--fu)", fontSize: 9, color: "#4A5878" }}>{s.l}</span>
              <span style={{ fontFamily: "var(--fm)", fontSize: 9, color: s.c, fontWeight: 600 }}>{s.v}/10</span>
            </div>
            <div className="score-track"><div className="score-fill" style={{ width: `${s.v * 10}%`, background: s.c, boxShadow: `0 0 4px ${s.c}70` }}></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
