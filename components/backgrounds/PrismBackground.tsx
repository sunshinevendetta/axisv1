"use client";

import Prism from "../Prism";

export default function PrismBackground() {
  return (
    <div
      className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ background: "black" }}
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
