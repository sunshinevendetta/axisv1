import { SPARK } from "../data/mock";

const STATS = [
  { v: "412K", l: "MONTHLY LISTENERS", d: "+4.1%" },
  { v: "2.8M", l: "STREAMS (30D)", d: "+6.3%" },
  { v: "18.6K", l: "PLAYLIST ADDS", d: "+3.7%" },
  { v: "7.2K", l: "FAN GROWTH", d: "+5.2%" },
];

const LEGEND: [string, string][] = [["#7A8BAA", "Events"], ["#C8D4F0", "Releases"], ["#7A8BAA", "Articles"]];

export default function PanelAnalytics() {
  return (
    <div className="bottom-panel">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: 10 }}>
        {STATS.map((s) => (
          <div key={s.l}>
            <div style={{ fontFamily: "var(--fm)", fontSize: 22, fontWeight: 700, color: "#E8EDF8", lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontFamily: "var(--fu)", fontSize: 8, color: "#4A5878", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 2 }}>{s.l}</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: 8, color: "#C8D4F0", marginTop: 1 }}>{s.d} vs last month</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 36, marginTop: "auto" }}>
        {SPARK.concat(SPARK).slice(0, 24).map((v, i) => {
          const c = i % 3 === 0 ? "#7A8BAA" : i % 3 === 1 ? "#C8D4F0" : "#7A8BAA";
          return <div key={i} style={{ flex: 1, height: `${(v / 20) * 100}%`, background: c, opacity: 0.7, borderRadius: "1px 1px 0 0" }}></div>;
        })}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
        {LEGEND.map(([c, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: c }}></div>
            <span style={{ fontFamily: "var(--fu)", fontSize: 8, color: "var(--t4)" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
