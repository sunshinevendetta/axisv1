"use client";

import PrismaticBurst from "../PrismaticBurst";

export default function PrismaticBurstBackground() {
  return (
    <div
      className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ background: "black" }}
    >
      <PrismaticBurst
        animationType="rotate3d"
        intensity={3.3}
        speed={1.15}
        distort={10}
        paused={false}
        offset={{ x: 0, y: 0 }}
        hoverDampness={0.25}
        rayCount={30}
        mixBlendMode="lighten"
        colors={["#fafafa","#0d0d0d","#7a7c79"]}
        color0="#bfbfbf"
        color1="#c0c0c0"
        color2=""
      />
    </div>
  );
}
