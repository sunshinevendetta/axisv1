import { AGE_DATA, COUNTRY_TOP } from "../data/mock";

const GENDER_LEGEND: [string, string][] = [["#7A8BAA", "72% Male"], ["#C8D4F0", "24% Female"], ["#7A8BAA", "4% Other"]];

export default function PanelDemo() {
  return (
    <div className="bottom-panel">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, height: "100%" }}>
        <div>
          <div style={{ fontFamily: "var(--fu)", fontSize: 8, color: "var(--t4)", letterSpacing: ".1em", marginBottom: 6 }}>AGE</div>
          {AGE_DATA.map((a) => (
            <div key={a.g} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--fu)", fontSize: 9, color: "var(--t3)" }}>{a.g}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: Math.round(a.p * 1.8), height: 3, background: "#C8D4F0", borderRadius: 2, opacity: 0.85 }}></div>
                <span style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--t4)" }}>{a.p}%</span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: "var(--fu)", fontSize: 8, color: "var(--t4)", letterSpacing: ".1em", marginBottom: 4 }}>GENDER</div>
          <svg width="64" height="64" viewBox="0 0 64 64">
            {(() => {
              const segs = [{ p: 0.72, c: "#7A8BAA" }, { p: 0.24, c: "#C8D4F0" }, { p: 0.04, c: "#7A8BAA" }];
              let off = 0;
              const r = 24;
              const circ = 2 * Math.PI * r;
              return segs.map((s, i) => {
                const dash = s.p * circ;
                const gap = circ - dash;
                const el = (
                  <circle key={i} cx={32} cy={32} r={r} fill="none" stroke={s.c} strokeWidth={9}
                    strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-off} transform="rotate(-90 32 32)" strokeOpacity={0.9} />
                );
                off += dash;
                return el;
              });
            })()}
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
            {GENDER_LEGEND.map(([c, l]) => (
              <div key={l} style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: c }}></div>
                <span style={{ fontFamily: "var(--fu)", fontSize: 8.5, color: "var(--t4)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--fu)", fontSize: 8, color: "var(--t4)", letterSpacing: ".1em", marginBottom: 6 }}>TOP COUNTRIES</div>
          {COUNTRY_TOP.map((c, i) => (
            <div key={c.c} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--fm)", fontSize: 7.5, color: "var(--t4)", width: 10 }}>{i + 1}.</span>
                <span style={{ fontFamily: "var(--fu)", fontSize: 9, color: "var(--t3)" }}>{c.c}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: Math.round(c.p * 1.3), height: 3, background: "#7A8BAA", borderRadius: 2, opacity: 0.85 }}></div>
                <span style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--t4)" }}>{c.p}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
