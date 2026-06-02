"use client";

import { useEffect } from "react";
import { useModule } from "./ModuleContext";

export default function ModuleHost() {
  const { expandedId, expandedRenderer, close } = useModule();

  useEffect(() => {
    if (!expandedId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedId, close]);

  if (!expandedId || !expandedRenderer) return null;

  return (
    <div className="mod-overlay" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="mod-overlay-inner">
        <div className="mod-overlay-hd">
          <span className="mod-overlay-title">{expandedId}</span>
          <button className="mod-btn mod-overlay-x" onClick={close} title="Close (Esc)">✕</button>
        </div>
        <div className="mod-overlay-body">
          {expandedRenderer(expandedId)}
        </div>
      </div>
    </div>
  );
}
