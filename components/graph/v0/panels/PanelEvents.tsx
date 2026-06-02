const EV_ROWS = [
  { name: "Berghain", city: "Berlin, DE", date: "May 24, 2024", cap: "1500" },
  { name: "Dekmantel Selectors", city: "Amsterdam, NL", date: "Aug 2, 2024", cap: "4000" },
  { name: "Keep Hush", city: "London, UK", date: "Jan 14, 2024", cap: "800" },
  { name: "Fabric", city: "London, UK", date: "Mar 8, 2024", cap: "1200" },
  { name: "De School", city: "Amsterdam, NL", date: "Nov 12, 2023", cap: "600" },
];

export default function PanelEvents() {
  return (
    <div className="bottom-panel" style={{ overflowY: "auto" }}>
      <div className="pt" style={{ marginBottom: 6 }}>LIVE EVENTS · HISTORY &amp; UPCOMING</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
        {EV_ROWS.map((e, i) => (
          <div key={i} style={{
            background: "#0A0D14", border: "1px solid #1C2235", borderRadius: 2, padding: "7px 8px", cursor: "pointer",
            transition: "border-color .15s",
          }}
            onMouseEnter={(ev) => (ev.currentTarget.style.borderColor = "#7A8BAA")}
            onMouseLeave={(ev) => (ev.currentTarget.style.borderColor = "#1C2235")}>
            <div style={{
              width: 24, height: 24, borderRadius: 1, background: "#1C2235", border: "1px solid #7A8BAA",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 5,
              fontFamily: "var(--fu)", fontSize: 8, fontWeight: 700, color: "#7A8BAA",
            }}>EV</div>
            <div style={{ fontFamily: "var(--fu)", fontSize: 10, fontWeight: 600, color: "var(--t2)", lineHeight: 1.2, marginBottom: 2 }}>{e.name}</div>
            <div style={{ fontFamily: "var(--fu)", fontSize: 8, color: "var(--t4)" }}>{e.city}</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: 7.5, color: "var(--t4)", marginTop: 2 }}>{e.date}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#7A8BAA" }}></div>
              <span style={{ fontFamily: "var(--fm)", fontSize: 7.5, color: "#7A8BAA" }}>{e.cap} cap</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
