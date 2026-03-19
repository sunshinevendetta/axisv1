"use client";

import { useEffect, useRef } from "react";

type Props = {
  sketchIndex: number;
  playing: boolean;
};

/**
 * Hydra-synth generative visual background.
 * Each sketch is tuned to match the vibe of the corresponding mixtape.
 * Falls back to an animated canvas if Hydra fails to load.
 */
export default function HydraBackground({ sketchIndex, playing }: Props) {
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
          detectAudio: false,
          enableStreamCapture: false,
          width: canvas.width,
          height: canvas.height,
        });

        hydraRef.current = h;
        runSketch(h.synth, sketchIndex, playing);
      } catch (err) {
        console.warn("[HydraBackground] Hydra failed, using canvas fallback:", err);
        isFallbackRef.current = true;
        runFallback(canvas, sketchIndex, playing);
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
      runSketch(synth, sketchIndex, playing);
    } catch {}
  }, [sketchIndex, playing]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
}

// ── Hydra sketches — one per mixtape ─────────────────────────────────────────

function runSketch(synth: any, idx: number, playing: boolean) {
  synth.speed = playing ? 1.0 : 0.25;

  const sketches: Array<() => void> = [

    // 0 — CYBEREALITY / HYPERBASS
    // Industrial oscillator — electric-blue, high-frequency, razor-sharp
    () => {
      synth.osc(38, 0.04, 1.1)
        .modulate(synth.noise(6, 0.45), 0.06)
        .color(0.04, 0.10, 0.35)
        .contrast(1.5)
        .brightness(-0.28)
        .out();
    },

    // 1 — Gasoiid / HYPERBASS RADIO
    // Pulsing geometry — deep navy, repeating, bass-heavy shapes
    () => {
      synth.shape(6, 0.55, 0.04)
        .repeat(4, 4, () => Math.sin(synth.time * 0.3) * 0.1, () => Math.cos(synth.time * 0.2) * 0.1)
        .modulate(synth.noise(3, 0.25), 0.04)
        .color(0.03, 0.06, 0.28)
        .rotate(() => synth.time * 0.04)
        .out();
    },

    // 2 — Fiesta Soundsystem / Sunshine Mix
    // Warm gradient flow — amber and deep orange, groovy undulation
    () => {
      synth.gradient(0.6)
        .modulate(synth.osc(5, 0.06, 1.8), 0.10)
        .color(0.55, 0.16, 0.02)
        .brightness(-0.45)
        .contrast(1.3)
        .out();
    },

    // 3 — Sunshine Vendetta / Synthesis
    // Voronoi ethereal — deep purple, slow drift, ambient
    () => {
      synth.voronoi(9, 0.18, 0.12)
        .modulate(synth.noise(2, 0.28), 0.05)
        .color(0.20, 0.04, 0.42)
        .brightness(-0.38)
        .out();
    },
  ];

  try {
    sketches[idx % sketches.length]?.();
  } catch (err) {
    console.warn("[HydraBackground] Sketch error:", err);
  }
}

// ── Canvas fallback (if Hydra won't load) ────────────────────────────────────

const FALLBACK_COLORS = [
  { r: 4, g: 10, b: 53 },   // electric blue
  { r: 4, g: 6, b: 40 },    // deep navy
  { r: 20, g: 8, b: 4 },    // amber dark
  { r: 8, g: 2, b: 18 },    // deep purple
];

function runFallback(canvas: HTMLCanvasElement, idx: number, playing: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { r, g, b } = FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
  let t = 0;

  const draw = () => {
    t += playing ? 0.012 : 0.003;
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 4; i++) {
      const phase = (i / 4) * Math.PI * 2;
      const amp = H * 0.06 * (playing ? 1 : 0.3);
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      for (let x = 0; x <= W; x += 6) {
        const y = H / 2 + Math.sin(x * 0.005 + t + phase) * amp
          + Math.sin(x * 0.009 + t * 1.3 + phase) * (amp * 0.5);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = `rgba(${r + 20},${g + 20},${b + 30},0.04)`;
      ctx.fill();
    }
  };

  const loop = () => { draw(); requestAnimationFrame(loop); };
  loop();
}
