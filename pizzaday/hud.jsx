// AXIS RALLY — shared HUD primitives
// Exposed on window for cross-script use.

const { useState, useEffect, useRef, useMemo } = React;

/* ---------- Brackets wrapper ---------- */
function Brackets({ children, className = '', style }) {
  return (
    <div className={`card ${className}`} style={style}>
      <span className="brk tl"></span>
      <span className="brk tr"></span>
      <span className="brk bl"></span>
      <span className="brk br"></span>
      {children}
    </div>
  );
}

/* ---------- Mono code label ---------- */
function MonoLabel({ children, dim }) {
  return (
    <span className="mono" style={{ color: dim ? 'var(--ink-4)' : 'var(--ink-3)' }}>
      {children}
    </span>
  );
}

/* ---------- Status pill ---------- */
function StatusPill() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time =
    String(t.getUTCHours()).padStart(2, '0') + ':' +
    String(t.getUTCMinutes()).padStart(2, '0') + ':' +
    String(t.getUTCSeconds()).padStart(2, '0');
  return (
    <div className="status-pill">
      <span className="dot"></span>
      <span>SYS · ONLINE</span>
      <span style={{ width: 1, height: 10, background: 'var(--line-2)' }}></span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{time} UTC</span>
    </div>
  );
}

/* ---------- Reg marks + HUD strip ---------- */
function RegMarks() {
  return (
    <div className="regmarks">
      <span className="rm tl"></span>
      <span className="rm tr"></span>
      <span className="rm bl"></span>
      <span className="rm br"></span>
    </div>
  );
}

function HudStrip({ screen, count }) {
  return (
    <div className="hud-strip">
      <div className="left">
        <span>BUILD <b>v0.4·alpha</b></span>
        <span>VIEW <b>{screen}</b></span>
        <span>UNITS <b>METRIC</b></span>
      </div>
      <div className="right">
        <span>NODE <b>AX·MEX·01</b></span>
        <span>SIGNAL <b>STRONG</b></span>
        <span>SEC <b>OK</b></span>
        {count != null && <span>ITEMS <b>{count}</b></span>}
      </div>
    </div>
  );
}

/* ---------- Live ticker ---------- */
function LiveTicker({ items, speed = 60 }) {
  const list = [...items, ...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-track" style={{ animationDuration: `${speed}s` }}>
        {list.map((it, i) => (
          <span className="ticker-item" key={i}>
            <span className="dot"></span>
            <span className="who">{it.who}</span>
            <span>·</span>
            <span>CLEARED</span>
            <span className="what">{it.what}</span>
            <span>·</span>
            <span style={{ color: 'var(--ink-4)' }}>+{it.xp || 2} XP</span>
            <span>·</span>
            <span style={{ color: 'var(--ink-4)' }}>{it.rank}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Medal placeholder ---------- */
function Medal({ variant = 'chrome', size = 220, type }) {
  // variant: chrome | poly | coin | foil
  const cls = `medal ${variant === 'chrome' ? '' : variant}`;
  return (
    <div className={cls} style={{ width: size, height: size }}>
      <div className="medal-ring r2"></div>
      <div className="medal-shape">
        {type && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'rgba(0,0,0,0.45)', fontFamily: 'var(--display)',
            fontSize: size * 0.32, fontWeight: 900, mixBlendMode: 'overlay',
          }}>{type}</div>
        )}
      </div>
      <div className="medal-ring"></div>
    </div>
  );
}

/* ---------- Reticle frame ---------- */
function Reticle({ size = 160, animated = true, label }) {
  return (
    <div style={{
      position: 'relative', width: size, height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span className="reticle" style={{
        width: size, height: size,
        animation: animated ? 'spinR 12s linear infinite' : 'none',
      }}></span>
      <span className="reticle" style={{
        width: size * 0.7, height: size * 0.7,
        animation: animated ? 'spinR 18s linear infinite reverse' : 'none',
        borderColor: 'var(--ink-5)',
      }}></span>
      {label && (
        <div className="mono-tight" style={{
          position: 'absolute', bottom: -22, color: 'var(--ink-3)',
        }}>{label}</div>
      )}
    </div>
  );
}

/* ---------- Loading bar (HUD style) ---------- */
function EnergyBar({ value, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {label && <span className="mono-tight" style={{ color: 'var(--ink-3)', minWidth: 60 }}>{label}</span>}
      <div className="bar" style={{ flex: 1 }}>
        <span style={{ width: `${value}%` }}></span>
      </div>
      <span className="mono-tight" style={{
        color: 'var(--ink-2)', minWidth: 36, textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
      }}>{Math.round(value)}%</span>
    </div>
  );
}

/* ---------- Glitch wrap (run animation on key change) ---------- */
function Glitch({ trigger, children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.classList.remove('glitch');
    void ref.current.offsetWidth;
    ref.current.classList.add('glitch');
  }, [trigger]);
  return <div ref={ref} className={className}>{children}</div>;
}

/* ---------- Background light streaks SVG ---------- */
function BgStage() {
  return (
    <div className="bg-stage" aria-hidden>
      <svg viewBox="0 0 1200 800" preserveAspectRatio="none">
        <defs>
          <linearGradient id="s1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0"/>
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.12"/>
            <stop offset="1" stopColor="#fff" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i}
            x1={Math.random()*1200} y1={-50}
            x2={Math.random()*1200} y2={850}
            stroke="url(#s1)"
            strokeWidth={Math.random()*1.2 + 0.3}
            opacity={Math.random()*0.5 + 0.1}/>
        ))}
      </svg>
    </div>
  );
}

/* ---------- Section header ---------- */
function SectionHead({ code, title, meta }) {
  return (
    <div className="section-head">
      <div>
        <div className="eyebrow" style={{ marginBottom: 18 }}>{code}</div>
        <h2>{title}</h2>
      </div>
      {meta && <div className="meta">{meta}</div>}
    </div>
  );
}

/* expose globals */
Object.assign(window, {
  Brackets, MonoLabel, StatusPill, RegMarks, HudStrip,
  LiveTicker, Medal, Reticle, EnergyBar, Glitch, BgStage, SectionHead,
});
