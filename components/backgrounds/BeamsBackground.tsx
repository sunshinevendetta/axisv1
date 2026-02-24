"use client";

import Beams from "../Beams";

export default function BeamsBackground() {
  return (
    <div
      className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ background: "black" }}
    >
      <Beams
        beamWidth={10}
    beamHeight={10}
    beamNumber={1}
    lightColor="#ffffff"
    speed={5}
    noiseIntensity={0}
    scale={1}
        rotation={0}
      />
    </div>
  );
}
