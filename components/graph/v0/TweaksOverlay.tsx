"use client";

import { useRef } from "react";
import type { Tweaks } from "./types";

interface Props {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => void;
  onClose: () => void;
}

const COLOR_KEYS: [keyof Tweaks, string][] = [
  ["accentArtist", "Artist"],
  ["accentGenre", "Genre"],
  ["accentEvent", "Event"],
  ["accentRelease", "Release"],
  ["accentArticle", "Article"],
];

export default function TweaksOverlay({ tweaks, setTweak, onClose }: Props) {
  const dragRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ right: 16, bottom: 16 });

  const onDragStart = (e: React.MouseEvent) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const sr = window.innerWidth - r.right;
    const sb = window.innerHeight - r.bottom;
    const move = (ev: MouseEvent) => {
      posRef.current = {
        right: Math.max(8, sr - (ev.clientX - sx)),
        bottom: Math.max(8, sb - (ev.clientY - sy)),
      };
      panel.style.right = posRef.current.right + "px";
      panel.style.bottom = posRef.current.bottom + "px";
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div ref={dragRef} className="twk-panel" style={{ right: posRef.current.right, bottom: posRef.current.bottom }}>
      <div className="twk-hd" onMouseDown={onDragStart}>
        <b>Tweaks</b>
        <button className="twk-x" onMouseDown={(e) => e.stopPropagation()} onClick={onClose}>✕</button>
      </div>
      <div className="twk-body">
        <div className="twk-sect">Node Colors</div>
        {COLOR_KEYS.map(([k, l]) => (
          <div key={k} className="twk-row twk-row-h">
            <div className="twk-lbl"><span>{l}</span></div>
            <input type="color" className="twk-swatch" value={tweaks[k] as string}
              onChange={(e) => setTweak(k, e.target.value as Tweaks[typeof k])} />
          </div>
        ))}
        <div className="twk-sect">Graph</div>
        <div className="twk-row">
          <div className="twk-lbl"><span>Edge Curve</span><span className="twk-val">{tweaks.edgeCurve}</span></div>
          <input type="range" className="twk-slider" min={0} max={0.6} step={0.02}
            value={tweaks.edgeCurve} onChange={(e) => setTweak("edgeCurve", Number(e.target.value))} />
        </div>
        <div className="twk-row">
          <div className="twk-lbl"><span>Node Glow</span><span className="twk-val">{tweaks.nodeGlow}px</span></div>
          <input type="range" className="twk-slider" min={2} max={32} step={1}
            value={tweaks.nodeGlow} onChange={(e) => setTweak("nodeGlow", Number(e.target.value))} />
        </div>
        <div className="twk-row twk-row-h">
          <div className="twk-lbl"><span>Show Grid</span></div>
          <button className="twk-toggle" data-on={tweaks.showGrid ? "1" : "0"}
            onClick={() => setTweak("showGrid", !tweaks.showGrid)}><i /></button>
        </div>
      </div>
    </div>
  );
}
