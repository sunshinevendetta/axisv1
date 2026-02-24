"use client";

import React, { useEffect, useRef } from "react";
import Prism from "./Prism";

export default function VideoBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      console.log("[PrismBG] Container ref attached, size:", containerRef.current.clientWidth, "x", containerRef.current.clientHeight);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100vh",
        zIndex: -30,
        pointerEvents: "none",
        background: "black",
        overflow: "hidden",
      }}
    >
      <Prism
        animationType="rotate"
        timeScale={0.6}
        height={4.5}
        baseWidth={7.6}
        scale={3}
        hueShift={0.46}
        colorFrequency={4}
        noise={0}
        glow={0.7}
      />
    </div>
  );
}