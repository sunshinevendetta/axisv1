"use client";

import { useEffect, useRef } from "react";

export type HydraControls = {
  noiseA1: number;
  noiseA2: number;
  oscA1: number;
  oscA2: number;
  oscA3: number;
  oscA4: number;
  oscA5: number;
  noiseB1: number;
  noiseB2: number;
  noiseB3: number;
  noiseB4: number;
  brightnessA: number;
  contrastA: number;
  oscB1: number;
  oscB2: number;
  oscB3: number;
  oscB4: number;
  noiseC1: number;
  noiseC2: number;
  noiseC3: number;
  oscC1: number;
  oscC2: number;
  oscC3: number;
  noiseD1: number;
  noiseD2: number;
  noiseD3: number;
  noiseD4: number;
  brightnessB: number;
  contrastB: number;
  oscD1: number;
  oscD2: number;
  oscD3: number;
  oscD4: number;
  rotateA: number;
  scaleA1: number;
  scaleA2: number;
  scaleA3: number;
  scaleA4: number;
  scaleA5: number;
  scaleA6: number;
  oscE1: number;
  oscE2: number;
  oscE3: number;
  oscF1: number;
  oscF2: number;
  oscF3: number;
  rotateB1: number;
  rotateB2: number;
  scaleB1: number;
  scaleB2: number;
  scaleC1: number;
  scaleC2: number;
  modScaleA: number;
  pixelateX: number;
  pixelateY: number;
  rotateC1: number;
  rotateC2: number;
  shape1: number;
  shape2: number;
  shape3: number;
  scaleD1: number;
  scaleD2: number;
};

export const DEFAULT_HYDRA_CONTROLS: HydraControls = {
  noiseA1: 77,
  noiseA2: 6,
  oscA1: 7,
  oscA2: 8,
  oscA3: 70,
  oscA4: 20,
  oscA5: 900,
  noiseB1: 500,
  noiseB2: 7,
  noiseB3: 900,
  noiseB4: 5,
  brightnessA: 0.1,
  contrastA: 100,
  oscB1: 79,
  oscB2: 1,
  oscB3: 3,
  oscB4: 13,
  noiseC1: 1,
  noiseC2: 5,
  noiseC3: 1,
  oscC1: 2,
  oscC2: 9,
  oscC3: 1,
  noiseD1: 18,
  noiseD2: 8,
  noiseD3: 5,
  noiseD4: 4,
  brightnessB: 0.02,
  contrastB: 1.3,
  oscD1: 9,
  oscD2: 0,
  oscD3: 5,
  oscD4: 13,
  rotateA: 33,
  scaleA1: 50,
  scaleA2: 24,
  scaleA3: 9,
  scaleA4: 7,
  scaleA5: 0.12,
  scaleA6: 0.15,
  oscE1: 3,
  oscE2: 9,
  oscE3: 1,
  oscF1: 3,
  oscF2: 10,
  oscF3: 70,
  rotateB1: 314,
  rotateB2: 7,
  scaleB1: 0.5,
  scaleB2: 10,
  scaleC1: 0.1,
  scaleC2: 1,
  modScaleA: 1,
  pixelateX: 160,
  pixelateY: 160,
  rotateC1: 0,
  rotateC2: 0.0001,
  shape1: 75,
  shape2: 0.9,
  shape3: 0.7,
  scaleD1: 2,
  scaleD2: 7,
};

export const HYDRA_CONTROL_GROUPS = [
  {
    title: "Primary Noise",
    controls: [
      { key: "noiseA1", label: "Noise A1", min: 1, max: 900, step: 1 },
      { key: "noiseA2", label: "Noise A2", min: 0, max: 20, step: 0.1 },
      { key: "oscA1", label: "Osc A1", min: 0, max: 20, step: 0.1 },
      { key: "oscA2", label: "Osc A2", min: 0, max: 20, step: 0.1 },
      { key: "oscA3", label: "Osc A3", min: 1, max: 200, step: 1 },
      { key: "oscA4", label: "Osc A4", min: 0, max: 100, step: 0.5 },
      { key: "oscA5", label: "Osc A5", min: 0, max: 1200, step: 10 },
      { key: "noiseB1", label: "Noise B1", min: 1, max: 900, step: 1 },
      { key: "noiseB2", label: "Noise B2", min: 0, max: 20, step: 0.1 },
      { key: "noiseB3", label: "Noise B3", min: 0, max: 1200, step: 10 },
      { key: "noiseB4", label: "Noise B4", min: 0, max: 20, step: 0.1 },
      { key: "brightnessA", label: "Bright A", min: 0, max: 1, step: 0.01 },
      { key: "contrastA", label: "Contrast A", min: 1, max: 150, step: 1 },
      { key: "oscB1", label: "Osc B1", min: 0, max: 120, step: 1 },
      { key: "oscB2", label: "Osc B2", min: 0, max: 20, step: 0.1 },
      { key: "oscB3", label: "Osc B3", min: 0.1, max: 20, step: 0.1 },
      { key: "oscB4", label: "Osc B4", min: 0, max: 30, step: 0.5 },
    ],
  },
  {
    title: "Feedback Layer",
    controls: [
      { key: "noiseC1", label: "Noise C1", min: 0, max: 50, step: 0.1 },
      { key: "noiseC2", label: "Noise C2", min: 0.1, max: 20, step: 0.1 },
      { key: "noiseC3", label: "Noise C3", min: 0, max: 20, step: 0.1 },
      { key: "oscC1", label: "Osc C1", min: 0, max: 20, step: 0.1 },
      { key: "oscC2", label: "Osc C2", min: 0, max: 20, step: 0.1 },
      { key: "oscC3", label: "Osc C3", min: 0, max: 10, step: 0.1 },
      { key: "noiseD1", label: "Noise D1", min: 0, max: 50, step: 0.1 },
      { key: "noiseD2", label: "Noise D2", min: 0, max: 20, step: 0.1 },
      { key: "noiseD3", label: "Noise D3", min: 0, max: 20, step: 0.1 },
      { key: "noiseD4", label: "Noise D4", min: 0, max: 20, step: 0.1 },
      { key: "brightnessB", label: "Bright B", min: 0, max: 1, step: 0.01 },
      { key: "contrastB", label: "Contrast B", min: 0.1, max: 10, step: 0.1 },
      { key: "oscD1", label: "Osc D1", min: 0, max: 30, step: 0.1 },
      { key: "oscD2", label: "Osc D2", min: 0, max: 20, step: 0.1 },
      { key: "oscD3", label: "Osc D3", min: 0.1, max: 20, step: 0.1 },
      { key: "oscD4", label: "Osc D4", min: 0, max: 30, step: 0.5 },
      { key: "rotateA", label: "Rotate A", min: 1, max: 120, step: 1 },
    ],
  },
  {
    title: "Scale Mod",
    controls: [
      { key: "scaleA1", label: "Scale A1", min: 1, max: 100, step: 1 },
      { key: "scaleA2", label: "Scale A2", min: 1, max: 60, step: 1 },
      { key: "scaleA3", label: "Scale A3", min: 0.1, max: 30, step: 0.1 },
      { key: "scaleA4", label: "Scale A4", min: 0, max: 20, step: 0.1 },
      { key: "scaleA5", label: "Scale A5", min: 0, max: 1, step: 0.01 },
      { key: "scaleA6", label: "Scale A6", min: 0, max: 1, step: 0.01 },
      { key: "oscE1", label: "Osc E1", min: 0, max: 20, step: 0.1 },
      { key: "oscE2", label: "Osc E2", min: 0, max: 20, step: 0.1 },
      { key: "oscE3", label: "Osc E3", min: 0, max: 10, step: 0.1 },
      { key: "oscF1", label: "Osc F1", min: 0, max: 20, step: 0.1 },
      { key: "oscF2", label: "Osc F2", min: 0, max: 20, step: 0.1 },
      { key: "oscF3", label: "Osc F3", min: 0, max: 200, step: 1 },
      { key: "rotateB1", label: "Rotate B1", min: 0, max: 500, step: 1 },
      { key: "rotateB2", label: "Rotate B2", min: 0.1, max: 20, step: 0.1 },
      { key: "scaleB1", label: "Scale B1", min: 0.1, max: 5, step: 0.05 },
      { key: "scaleB2", label: "Scale B2", min: 0, max: 30, step: 0.1 },
      { key: "scaleC1", label: "Scale C1", min: 0.01, max: 5, step: 0.01 },
      { key: "scaleC2", label: "Scale C2", min: 0, max: 5, step: 0.1 },
      { key: "modScaleA", label: "Mod Scale", min: 0.1, max: 5, step: 0.05 },
    ],
  },
  {
    title: "Pixel Shape",
    controls: [
      { key: "pixelateX", label: "Pixel X", min: 16, max: 320, step: 1 },
      { key: "pixelateY", label: "Pixel Y", min: 16, max: 320, step: 1 },
      { key: "rotateC1", label: "Rotate C1", min: 0, max: 10, step: 0.01 },
      { key: "rotateC2", label: "Rotate C2", min: 0.00001, max: 0.01, step: 0.00001 },
      { key: "shape1", label: "Shape 1", min: 3, max: 100, step: 1 },
      { key: "shape2", label: "Shape 2", min: 0, max: 1.5, step: 0.01 },
      { key: "shape3", label: "Shape 3", min: 0, max: 1.5, step: 0.01 },
      { key: "scaleD1", label: "Scale D1", min: 0.1, max: 10, step: 0.1 },
      { key: "scaleD2", label: "Scale D2", min: 0, max: 20, step: 0.1 },
    ],
  },
] as const;

type Props = {
  sketchIndex: number;
  playing: boolean;
  controls: HydraControls;
};

/**
 * Hydra-synth generative visual background.
 * Each sketch is tuned to match the vibe of the corresponding mixtape.
 * Falls back to an animated canvas if Hydra fails to load.
 */
export default function HydraBackground({ sketchIndex, playing, controls }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hydraRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const isFallbackRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let mounted = true;

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const initHydra = async () => {
      try {
        const HydraModule = await import("hydra-synth");
        const Hydra = HydraModule.default ?? HydraModule;

        if (!mounted || !canvas) return;

        // Dispose previous instance
        try { hydraRef.current?.synth?.stop?.(); } catch {}

        const h = new Hydra({
          canvas,
          autoLoop: true,
          makeGlobal: false,
          detectAudio: true,
          enableStreamCapture: false,
          width: canvas.width,
          height: canvas.height,
        });

        hydraRef.current = h;
        runSketch(h.synth, playing, controls);
      } catch (err) {
        console.warn("[HydraBackground] Hydra failed, using canvas fallback:", err);
        isFallbackRef.current = true;
        runFallback(canvas, playing, controls);
      }
    };

    initHydra();

    return () => {
      mounted = false;
      window.removeEventListener("resize", resize);
      try { hydraRef.current?.synth?.stop?.(); } catch {}
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // init once

  // Update sketch + speed when props change
  useEffect(() => {
    if (isFallbackRef.current) return;
    const synth = hydraRef.current?.synth;
    if (!synth) return;
    try {
      synth.speed = playing ? 1.0 : 0.25;
      runSketch(synth, playing, controls);
    } catch {}
  }, [sketchIndex, playing, controls]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
}

// ── Shared Hydra sketch — always active behind the disc ──────────────────────

function runSketch(synth: any, playing: boolean, controls: HydraControls) {
  synth.speed = playing ? 1.0 : 0.25;

  try {
    const audio = synth.a;
    if (audio?.setBins) {
      audio.setBins(8);
    }

    synth
      .noise(controls.noiseA1, controls.noiseA2)
      .mult(synth.osc(controls.oscA1, controls.oscA2, () => Math.sin(synth.time / controls.oscA3) * controls.oscA4, controls.oscA5))
      .mult(
        synth.noise(controls.noiseB1, controls.noiseB2, controls.noiseB3, () => (audio?.fft?.[3] ?? 0) * controls.noiseB4)
          .brightness(() => (audio?.fft?.[1] ?? 0) * controls.brightnessA)
          .contrast(controls.contrastA)
          .mult(synth.osc(controls.oscB1, controls.oscB2, () => Math.sin(synth.time / controls.oscB3) + controls.oscB4)),
      )
      .out(synth.o0);

    synth
      .noise(controls.noiseC1, () => (audio?.fft?.[0] ?? 0) / controls.noiseC2, controls.noiseC3)
      .modulate(synth.osc(controls.oscC1, controls.oscC2, () => controls.oscC3).diff(synth.o0))
      .diff(
        synth.noise(controls.noiseD1, controls.noiseD2, controls.noiseD3, controls.noiseD4)
          .brightness(controls.brightnessB)
          .contrast(controls.contrastB)
          .mult(synth.osc(controls.oscD1, controls.oscD2, () => Math.sin(synth.time / controls.oscD3) + controls.oscD4))
          .rotate(() => synth.time / controls.rotateA),
      )
      .scale(() => controls.scaleA1, () => controls.scaleA2, () => Math.sin(synth.time / controls.scaleA3 + controls.scaleA4) * controls.scaleA5 + controls.scaleA6)
      .modulateScale(
        synth.osc(controls.oscE1, controls.oscE2, () => controls.oscE3)
          .mult(synth.osc(controls.oscF1, controls.oscF2, controls.oscF3).rotate(controls.rotateB1 / controls.rotateB2))
          .rotate(() => (audio?.fft?.[3] ?? 0) / controls.scaleB1)
          .scale(controls.scaleB2, () => (audio?.fft?.[2] ?? 0) + 1)
          .scale(controls.scaleC1, () => (audio?.fft?.[6] ?? 0) + controls.scaleC2)
          .invert(),
        () => (audio?.fft?.[1] ?? 0) * Math.sin(synth.time / controls.modScaleA),
      )
      .pixelate(controls.pixelateX, controls.pixelateY)
      .rotate(controls.rotateC1, () => synth.time / controls.rotateC2)
      .mult(synth.shape(() => controls.shape1, controls.shape2, controls.shape3).scale(controls.scaleD1, () => (audio?.fft?.[0] ?? 0) * controls.scaleD2))
      .out();
  } catch (err) {
    console.warn("[HydraBackground] Sketch error:", err);
  }
}

// ── Canvas fallback (if Hydra won't load) ────────────────────────────────────

function runFallback(canvas: HTMLCanvasElement, playing: boolean, controls: HydraControls) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  let t = 0;

  const draw = () => {
    t += (playing ? 0.012 : 0.003) * (controls.oscA4 / 20);
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = "rgb(2, 5, 16)";
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 5; i++) {
      const phase = (i / 5) * Math.PI * 2;
      const amp = H * 0.08 * (playing ? 1 : 0.35) * (controls.scaleD2 / 7);
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      for (let x = 0; x <= W; x += 6) {
        const y = H / 2
          + Math.sin(x * 0.007 + t * 1.8 + phase) * amp
          + Math.cos(x * 0.011 + t * 1.1 + phase) * (amp * 0.45);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = `rgba(${90 + i * 25}, ${110 + i * 18}, ${255 - i * 20}, ${0.03 * (controls.contrastB / 1.3)})`;
      ctx.fill();
    }
  };

  const loop = () => { draw(); requestAnimationFrame(loop); };
  loop();
}
