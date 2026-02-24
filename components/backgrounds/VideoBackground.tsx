"use client";

import LightRays from '../LightRays'; // ← make sure this path is correct relative to your folder structure

export default function VideoBackground() {
  return (
    <div 
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
    >
      <LightRays
          raysOrigin="bottom-center"
    raysColor="#ffffff"
    raysSpeed={7}
    lightSpread={200}
    rayLength={7}
    followMouse={false}
    mouseInfluence={0.1}
    noiseAmount={0}
    distortion={0.1}
    className="custom-rays w-full h-full"
    pulsating={true}
    fadeDistance={1}
    saturation={1}
      />
    </div>
  );
}