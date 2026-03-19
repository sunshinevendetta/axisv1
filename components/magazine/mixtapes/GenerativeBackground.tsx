"use client";

import { useEffect, useRef } from "react";

type Props = {
  color: string;
  accentColor: string;
  playing: boolean;
};

/**
 * Generative canvas background — shifts with the active mixtape color.
 * Draws animated particles + low-frequency sine waves that pulse to simulate
 * audio reactivity. Visual-mixtape aesthetic.
 */
export default function GenerativeBackground({ color, accentColor, playing }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);

  // Parse hex to [r,g,b]
  const hexToRgb = (hex: string): [number, number, number] => {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const [r, g, b] = hexToRgb(color);
    const [ar, ag, ab] = hexToRgb(accentColor);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const speed = playing ? 1 : 0.3;
      tRef.current += 0.008 * speed;
      const t = tRef.current;

      // Clear
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(0, 0, W, H);

      // Sine wave layers
      const layers = 5;
      for (let l = 0; l < layers; l++) {
        const phase = (l / layers) * Math.PI * 2;
        const amp = H * (0.04 + l * 0.025) * (playing ? 1 : 0.4);
        const freq = 0.003 + l * 0.0015;
        const alpha = 0.025 - l * 0.003;

        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        for (let x = 0; x <= W; x += 4) {
          const y =
            H / 2 +
            Math.sin(x * freq + t + phase) * amp +
            Math.sin(x * freq * 1.7 + t * 1.3 + phase) * (amp * 0.5);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${alpha})`;
        ctx.fill();
      }

      // Particle field
      const particleCount = playing ? 40 : 15;
      const seed = 42;
      for (let i = 0; i < particleCount; i++) {
        // Deterministic "random" based on index + time for smooth motion
        const px = ((i * 137.5 + seed) % 100) / 100;
        const py = ((i * 73.1 + seed) % 100) / 100;
        const drift = Math.sin(t * 0.4 + i) * 0.02;
        const x = (px + drift) * W;
        const y = (py + Math.cos(t * 0.3 + i * 0.7) * 0.015) * H;
        const size = 0.8 + Math.sin(t * 0.8 + i) * 0.4;
        const a = (0.06 + Math.abs(Math.sin(t * 0.5 + i)) * 0.06) * (playing ? 1 : 0.4);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }

      // Center radial glow
      const glowX = W / 2 + Math.sin(t * 0.15) * W * 0.04;
      const glowY = H / 2 + Math.cos(t * 0.12) * H * 0.04;
      const glowR = Math.min(W, H) * (playing ? 0.45 : 0.25);
      const grd = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowR);
      grd.addColorStop(0, `rgba(${ar},${ag},${ab},${playing ? 0.09 : 0.03})`);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [color, accentColor, playing]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
}
