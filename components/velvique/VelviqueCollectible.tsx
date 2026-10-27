"use client";

/* The guest's collectible as a physical-feeling card: both faces are painted
   from the assigned recipe (bottle, name, pour proportions, signature), so the
   object on screen is the same identity the onchain metadata will carry. */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type CollectibleCard = {
  queueNumber: number;
  guestName: string | null;
  recipeId: string;
  signatureHash: string;
  assignedAt: string;
  build: Array<{ ingredientId: string; name: string; ml: number }>;
  garnish: { id: string; name: string } | null;
  narrative: { name: string; reading: string } | null;
};

export type CardLabels = {
  number: (n: number) => string;
  recipe: string;
  finishedWith: (garnish: string) => string;
  madeOnce: string;
  signature: string;
  madeFor: (name: string) => string;
};

const W = 1024;
const H = 1656;
const CARD_W = 1;
const CARD_H = H / W;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

async function fonts() {
  const style = getComputedStyle(document.body);
  const body = style.getPropertyValue("--font-body").trim() || "sans-serif";
  const display = style.getPropertyValue("--font-display").trim() || body;
  await Promise.all([document.fonts.load(`64px ${display}`), document.fonts.load(`32px ${body}`)]).catch(() => undefined);
  return { body, display };
}

function fitText(ctx: CanvasRenderingContext2D, text: string, family: string, size: number, maxWidth: number) {
  let px = size;
  ctx.font = `${px}px ${family}`;
  while (px > 14 && ctx.measureText(text).width > maxWidth) {
    px -= 1;
    ctx.font = `${px}px ${family}`;
  }
}

function frame(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, W - 72, H - 72);
}

async function paintFront(card: CollectibleCard, labels: CardLabels) {
  const [{ body, display }, bottle, logo] = await Promise.all([fonts(), loadImage("/velvique/velvique-bottle.webp"), loadImage("/velvique/velvique-logo.webp")]);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  frame(ctx);

  const glow = ctx.createRadialGradient(W / 2, 720, 40, W / 2, 720, 520);
  glow.addColorStop(0, "rgba(255,255,255,0.16)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const logoW = 440;
  ctx.drawImage(logo, 84, 96, logoW, (logo.height / logo.width) * logoW);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.textAlign = "right";
  /* The token number is only known once minted; until then the corner stays empty. */
  if (card.queueNumber > 0) {
    fitText(ctx, labels.number(card.queueNumber), body, 30, 360);
    ctx.fillText(labels.number(card.queueNumber), W - 84, 136);
  }

  const bottleH = 860;
  const bottleW = (bottle.width / bottle.height) * bottleH;
  ctx.drawImage(bottle, (W - bottleW) / 2, 210, bottleW, bottleH);

  /* Pour proportions: one segment per poured component, widths in ml. */
  const barX = 84;
  const barW = W - 168;
  const barY = 1150;
  let x = barX;
  card.build.forEach((item, index) => {
    const w = (item.ml / 45) * barW;
    ctx.fillStyle = `rgba(255,255,255,${0.92 - index * 0.2})`;
    ctx.fillRect(x, barY, w - 4, 18);
    x += w;
  });
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `24px ${body}`;
  ctx.textAlign = "left";
  ctx.fillText(card.build.map((item) => `${item.ingredientId} ${item.ml} ml`).join("   "), barX, barY + 54);

  /* Shrink the name until every line, including single long words, fits the frame. */
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  const name = (card.narrative?.name ?? card.recipeId).toUpperCase();
  let size = 68;
  let lines: string[] = [];
  for (; size >= 36; size -= 4) {
    ctx.font = `${size}px ${display}`;
    lines = wrap(ctx, name, W - 168).slice(0, 3);
    if (lines.every((line) => ctx.measureText(line).width <= W - 168)) break;
  }
  /* Stack from the bottom edge up: tagline, then "made for", then the name. */
  const madeForY = H - 84 - 64;
  const lastLineY = card.guestName ? madeForY - 58 : H - 84 - 72;
  lines.forEach((line, i) => ctx.fillText(line, 84, lastLineY - (lines.length - 1 - i) * (size + 8)));
  if (card.guestName) {
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    fitText(ctx, labels.madeFor(card.guestName), body, 32, W - 168);
    ctx.fillText(labels.madeFor(card.guestName), 84, madeForY);
  }

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  fitText(ctx, labels.madeOnce, body, 26, W - 168);
  ctx.fillText(labels.madeOnce, 84, H - 84);
  return canvas;
}

async function paintBack(card: CollectibleCard, labels: CardLabels) {
  const { body, display } = await fonts();
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  frame(ctx);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = `56px ${display}`;
  ctx.fillText(labels.recipe, 84, 180);

  let y = 290;
  for (const item of card.build) {
    ctx.fillStyle = "#ffffff";
    ctx.font = `34px ${body}`;
    ctx.textAlign = "left";
    ctx.fillText(item.name, 84, y);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText(`${item.ml.toFixed(1)} ml`, W - 84, y);
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fillRect(84, y + 30, W - 168, 2);
    y += 96;
  }

  ctx.textAlign = "left";
  if (card.garnish) {
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = `30px ${body}`;
    ctx.fillText(labels.finishedWith(card.garnish.name), 84, y + 20);
    y += 90;
  }

  if (card.narrative?.reading) {
    ctx.fillStyle = "#ffffff";
    ctx.font = `38px ${body}`;
    wrap(ctx, card.narrative.reading, W - 168)
      .slice(0, 6)
      .forEach((line, i) => ctx.fillText(line, 84, y + 60 + i * 52));
  }

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `26px ${body}`;
  ctx.fillText(`${labels.signature} ${card.signatureHash}`, 84, H - 160);
  ctx.fillText(`${card.recipeId}, ${new Date(card.assignedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`, 84, H - 122);
  ctx.fillText("Velvique × AXIS", 84, H - 84);
  return canvas;
}

/* Front face as a JPEG data URL: the image uploaded to Grove for the collectible. */
export async function renderCardImage(card: CollectibleCard, labels: CardLabels) {
  const canvas = await paintFront(card, labels);
  return canvas.toDataURL("image/jpeg", 0.9);
}

function toTexture(canvas: HTMLCanvasElement, maxAnisotropy: number) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

const REDUCED = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Card({ card, labels, flipped, onFlip }: { card: CollectibleCard; labels: CardLabels; flipped: boolean; onFlip: () => void }) {
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const { gl, size, camera } = useThree();
  const [faces, setFaces] = useState<[THREE.Texture, THREE.Texture] | null>(null);
  const drag = useRef({ active: false, startX: 0, startY: 0, moved: 0, dx: 0, dy: 0 });

  useEffect(() => {
    let disposed = false;
    const aniso = gl.capabilities.getMaxAnisotropy();
    void Promise.all([paintFront(card, labels), paintBack(card, labels)]).then(([front, back]) => {
      if (!disposed) setFaces([toTexture(front, aniso), toTexture(back, aniso)]);
    });
    return () => {
      disposed = true;
    };
  }, [card, labels, gl]);

  useEffect(() => () => faces?.forEach((t) => t.dispose()), [faces]);

  /* Fit the card to the stage with a little air on every side. */
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const halfFov = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const aspect = size.width / Math.max(1, size.height);
    cam.position.z = Math.max((CARD_H * 1.18) / (2 * halfFov), (CARD_W * 1.4) / (2 * halfFov * aspect));
    cam.updateProjectionMatrix();
  }, [camera, size]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const d = drag.current;
      if (!d.active) return;
      d.dx = (event.clientX - d.startX) / size.width;
      d.dy = (event.clientY - d.startY) / size.height;
      d.moved = Math.max(d.moved, Math.abs(event.clientX - d.startX) + Math.abs(event.clientY - d.startY));
    };
    const up = () => {
      const d = drag.current;
      if (!d.active) return;
      d.active = false;
      if (d.moved < 8) onFlip();
      else if (Math.abs(d.dx) > 0.28) onFlip();
      d.dx = 0;
      d.dy = 0;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [onFlip, size]);

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.getElapsedTime();
    const d = drag.current;
    const sway = REDUCED || d.active ? 0 : Math.sin(t * 0.6) * 0.14;
    const targetY = (flipped ? Math.PI : 0) + d.dx * Math.PI * 1.2 + sway;
    const targetX = -d.dy * 0.8 + (REDUCED ? 0 : Math.sin(t * 0.4) * 0.04);
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 6, delta);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 6, delta);
    }
    /* The highlight follows the finger, so the gloss reads as a real card. */
    if (light.current) light.current.position.set(pointer.x * 1.4, pointer.y * 1.4, 2.2);
  });

  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: "#cfcfcf", metalness: 0.85, roughness: 0.3 });
    const face = (map: THREE.Texture | null) =>
      new THREE.MeshPhysicalMaterial({ map, color: map ? "#ffffff" : "#111111", roughness: 0.5, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.35 });
    return [edge, edge, edge, edge, face(faces?.[0] ?? null), face(faces?.[1] ?? null)];
  }, [faces]);

  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[-2, 3, 4]} intensity={1.6} />
      <pointLight ref={light} intensity={1.1} distance={5} decay={2} />
      <group ref={group}>
        <mesh
          material={materials}
          onPointerDown={(event) => {
            event.stopPropagation();
            drag.current = { active: true, startX: event.clientX, startY: event.clientY, moved: 0, dx: 0, dy: 0 };
          }}
        >
          <boxGeometry args={[CARD_W, CARD_H, 0.014]} />
        </mesh>
      </group>
    </>
  );
}

export default function VelviqueCollectible({
  card,
  labels,
  flipped,
  onFlip,
}: {
  card: CollectibleCard;
  labels: CardLabels;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <Canvas className="vq-card-canvas" camera={{ fov: 35, position: [0, 0, 4.2] }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <Card card={card} labels={labels} flipped={flipped} onFlip={onFlip} />
      </Suspense>
    </Canvas>
  );
}
