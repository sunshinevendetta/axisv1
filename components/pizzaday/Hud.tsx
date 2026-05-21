"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type { FeedItem } from "./data";

export function Brackets({
  children,
  className = "",
  style,
  onClick,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div className={`pdq-card ${className}`} style={style} onClick={onClick}>
      <span className="pdq-brk pdq-tl" />
      <span className="pdq-brk pdq-tr" />
      <span className="pdq-brk pdq-bl" />
      <span className="pdq-brk pdq-br" />
      {children}
    </div>
  );
}

export function MonoLabel({ children, dim }: { children: ReactNode; dim?: boolean }) {
  return (
    <span className="pdq-mono" style={{ color: dim ? "var(--pdq-ink-4)" : "var(--pdq-ink-3)" }}>
      {children}
    </span>
  );
}

export function StatusPill({
  authenticated = false,
  address,
  onSignOut,
}: {
  authenticated?: boolean;
  address?: string | null;
  onSignOut?: () => void;
}) {
  const [t, setT] = useState<Date | null>(null);

  useEffect(() => {
    setT(new Date());
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = t
    ? `${String(t.getUTCHours()).padStart(2, "0")}:${String(t.getUTCMinutes()).padStart(2, "0")}:${String(
        t.getUTCSeconds(),
      ).padStart(2, "0")}`
    : "--:--:--";

  return (
    <div className="pdq-status-pill" style={{ alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="pdq-dot" style={{ background: authenticated ? "#3aff7a" : "#ffb84d" }} />
        <span>{authenticated ? "AUTH VERIFIED" : "AUTH LOCKED"}</span>
      </div>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{time} UTC</span>
      {address ? <span>{address}</span> : null}
      {authenticated && onSignOut ? (
        <button
          type="button"
          onClick={onSignOut}
          style={{
            appearance: "none",
            border: 0,
            background: "transparent",
            color: "inherit",
            font: "inherit",
            letterSpacing: "inherit",
            textTransform: "inherit",
            cursor: "pointer",
            padding: 0,
          }}
        >
          SIGN OUT
        </button>
      ) : null}
    </div>
  );
}

export function RegMarks() {
  return (
    <div className="pdq-regmarks">
      <span className="pdq-rm pdq-tl" />
      <span className="pdq-rm pdq-tr" />
      <span className="pdq-rm pdq-bl" />
      <span className="pdq-rm pdq-br" />
    </div>
  );
}

export function HudStrip({
  screen,
  count,
  security = "LOCKED",
}: {
  screen: string;
  count?: number;
  security?: string;
}) {
  return (
    <div className="pdq-hud-strip">
      <div className="left">
        <span>
          BUILD <b>v0.4 alpha</b>
        </span>
        <span>
          VIEW <b>{screen}</b>
        </span>
        <span>
          UNITS <b>METRIC</b>
        </span>
      </div>
      <div className="right">
        <span>
          HUB <b>AX·MEX·01</b>
        </span>
        <span>
          LINK <b>GOOD</b>
        </span>
        <span>
          SEC <b>{security}</b>
        </span>
        {count != null && (
          <span>
            ITEMS <b>{count}</b>
          </span>
        )}
      </div>
    </div>
  );
}

export function LiveTicker({ items, speed = 60 }: { items: FeedItem[]; speed?: number }) {
  const list = [...items, ...items, ...items];
  return (
    <div className="pdq-ticker">
      <div className="pdq-ticker-track" style={{ animationDuration: `${speed}s` }}>
        {list.map((it, i) => (
          <span className="pdq-ticker-item" key={i}>
            <span className="pdq-dot" />
            <span className="who">{it.who}</span>
            <span>·</span>
            <span>DONE</span>
            <span className="what">{it.what}</span>
            <span>·</span>
            <span style={{ color: "var(--pdq-ink-4)" }}>+{it.xp || 2} XP</span>
            <span>·</span>
            <span style={{ color: "var(--pdq-ink-4)" }}>{it.rank}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Medal({
  variant = "chrome",
  size = 220,
  type,
}: {
  variant?: "chrome" | "poly" | "coin" | "foil";
  size?: number | string;
  type?: string;
}) {
  const cls = `pdq-medal ${variant === "chrome" ? "" : variant}`;
  const numericSize = typeof size === "number" ? size : 220;
  const fontSize = numericSize * 0.32;
  return (
    <div className={cls} style={{ width: size, height: size }}>
      <div className="pdq-medal-ring r2" />
      <div className="pdq-medal-shape">
        {type && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(0,0,0,0.45)",
              fontFamily: "var(--pdq-display)",
              fontSize,
              fontWeight: 900,
              mixBlendMode: "overlay",
            }}
          >
            {type}
          </div>
        )}
      </div>
      <div className="pdq-medal-ring" />
    </div>
  );
}

export function Reticle({
  size = 160,
  animated = true,
  label,
}: {
  size?: number;
  animated?: boolean;
  label?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        className="pdq-reticle"
        style={{
          width: size,
          height: size,
          animation: animated ? "pdqSpinR 12s linear infinite" : "none",
        }}
      />
      <span
        className="pdq-reticle"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          animation: animated ? "pdqSpinR 18s linear infinite reverse" : "none",
          borderColor: "var(--pdq-ink-5)",
        }}
      />
      {label && (
        <div
          className="pdq-mono-tight"
          style={{
            position: "absolute",
            bottom: -22,
            color: "var(--pdq-ink-3)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

export function EnergyBar({ value, label }: { value: number; label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {label && (
        <span className="pdq-mono-tight" style={{ color: "var(--pdq-ink-3)", minWidth: 60 }}>
          {label}
        </span>
      )}
      <div className="pdq-bar" style={{ flex: 1 }}>
        <span style={{ width: `${value}%` }} />
      </div>
      <span
        className="pdq-mono-tight"
        style={{
          color: "var(--pdq-ink-2)",
          minWidth: 36,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {Math.round(value)}%
      </span>
    </div>
  );
}

export function Glitch({
  trigger,
  children,
  className = "",
}: {
  trigger: unknown;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.classList.remove("pdq-glitch");
    void node.offsetWidth;
    node.classList.add("pdq-glitch");
  }, [trigger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function BgStage() {
  const [lines, setLines] = useState<Array<{ x1: number; x2: number; w: number; o: number }>>([]);

  useEffect(() => {
    setLines(
      Array.from({ length: 24 }).map(() => ({
        x1: Math.random() * 1200,
        x2: Math.random() * 1200,
        w: Math.random() * 1.2 + 0.3,
        o: Math.random() * 0.5 + 0.1,
      })),
    );
  }, []);

  return (
    <div className="pdq-bg-stage" aria-hidden>
      <svg viewBox="0 0 1200 800" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pdq-s1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.12" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={-50}
            x2={l.x2}
            y2={850}
            stroke="url(#pdq-s1)"
            strokeWidth={l.w}
            opacity={l.o}
          />
        ))}
      </svg>
    </div>
  );
}

export function SectionHead({
  code,
  title,
  meta,
}: {
  code: string;
  title: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="pdq-section-head">
      <div>
        <div className="pdq-eyebrow" style={{ marginBottom: 18 }}>
          {code}
        </div>
        <h2>{title}</h2>
      </div>
      {meta && <div className="pdq-section-meta">{meta}</div>}
    </div>
  );
}
