"use client";

/**
 * ArenaScene — ambient 3D trading world for the Trading Arena 2026 deck.
 *
 * Composition (market semantics: white/silver = up, --arena-red = down; red is
 * data only — dim and sparse — never decoration; no other hues):
 *   - Two instanced 3D candlestick series running through the mid-ground like
 *     a skyline. Deterministic seeded random walks. The newest candle "forms"
 *     (eases toward its close with a light oscillation) and the whole series
 *     conveys forward — a new candle every few seconds.
 *   - Order-book depth walls: cumulative-depth histogram staircases flanking
 *     the frame — bid side monochrome silver, ask side a faint red tint —
 *     receding into fog.
 *   - A glowing white price-line ribbon drawing itself above/through the
 *     candles, with deterministic sharp drops where a faint red liquidation
 *     flash pulses.
 *
 * Scroll progress (0..1) gently drives camera drift.
 * prefers-reduced-motion → static fully-formed frame (frameloop="demand").
 * Hidden tab → rendering paused via frameloop="demand".
 * All heavy elements are instanced; per-frame work is matrix/uniform updates
 * only, with zero per-frame allocations. Everything is seeded/deterministic.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";

type ScrollRef = { current: number };
type Vec3 = [number, number, number];

/* Deterministic PRNG so every layout is stable across SSR/client/remounts. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* Shared scratch objects — reused everywhere, never allocated per frame. */
const _mat4 = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _scl = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _col = new THREE.Color();

/* Market palette: silver = up/long, dim red = down/short (data, not decor). */
const COLOR_UP = new THREE.Color("#d3d7dd");
const COLOR_DOWN = new THREE.Color("#ff2b3f").multiplyScalar(0.38);

/* ------------------------------------------------------------------ */
/* Candlestick series — instanced bodies + wicks, seeded random walk,  */
/* conveying forward with the newest candle forming live               */
/* ------------------------------------------------------------------ */

type Candle = {
  open: number;
  close: number;
  high: number;
  low: number;
  /** per-candle luminance variation, baked at generation time */
  v: number;
};

function makeCandleStream(seed: number) {
  const rand = seeded(seed);
  let price = 0;
  return (): Candle => {
    const open = price;
    // Slight up-bias (silver dominates; red stays sparse) + mean reversion.
    const close = open + (rand() - 0.46) * 0.5 - open * 0.07;
    const span = Math.abs(close - open);
    const high = Math.max(open, close) + rand() * (0.09 + span * 0.6);
    const low = Math.min(open, close) - rand() * (0.09 + span * 0.6);
    price = close;
    return { open, close, high, low, v: 0.82 + rand() * 0.36 };
  };
}

function SceneCandleChart({
  seed,
  count,
  spacing,
  yScale,
  tone,
  period,
  phase,
  position,
  rotationY,
  animate,
}: {
  seed: number;
  count: number;
  spacing: number;
  yScale: number;
  /** overall luminance multiplier (dims the far chart) */
  tone: number;
  /** seconds between new candles */
  period: number;
  /** time offset so multiple charts never roll over in sync */
  phase: number;
  position: Vec3;
  rotationY: number;
  animate: boolean;
}) {
  const conveyor = useRef<THREE.Group>(null!);
  const lastCycle = useRef(-1);

  const built = useMemo(() => {
    const next = makeCandleStream(seed);
    const data: Candle[] = Array.from({ length: count }, next);

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: "#ffffff", // multiplied by per-instance colors
      metalness: 0.75,
      roughness: 0.38,
      envMapIntensity: 0.55,
      emissive: "#0b0c0e",
    });
    const bodies = new THREE.InstancedMesh(geo, material, count);
    const wicks = new THREE.InstancedMesh(geo, material, count);
    bodies.frustumCulled = false;
    wicks.frustumCulled = false;
    bodies.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    wicks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const bodyW = spacing * 0.62;
    const wickW = bodyW * 0.18;
    const xAt = (i: number) => (i - (count - 1) / 2) * spacing;

    /** Write one candle's body + wick matrices and colors (no allocations). */
    const writeCandle = (i: number, c: Candle, dispClose: number, form: number) => {
      const x = xAt(i);

      const bodyH = Math.max(Math.abs(dispClose - c.open) * yScale, 0.05);
      _pos.set(x, ((c.open + dispClose) / 2) * yScale, 0);
      _scl.set(bodyW, bodyH, bodyW);
      _mat4.compose(_pos, _quat, _scl);
      bodies.setMatrixAt(i, _mat4);

      const hi = Math.max(c.open, dispClose) + (c.high - Math.max(c.open, c.close)) * form;
      const lo = Math.min(c.open, dispClose) - (Math.min(c.open, c.close) - c.low) * form;
      const wickH = Math.max((hi - lo) * yScale, 0.02);
      _pos.set(x, ((hi + lo) / 2) * yScale, 0);
      _scl.set(wickW, wickH, wickW);
      _mat4.compose(_pos, _quat, _scl);
      wicks.setMatrixAt(i, _mat4);

      _col.copy(dispClose >= c.open ? COLOR_UP : COLOR_DOWN).multiplyScalar(c.v * tone);
      bodies.setColorAt(i, _col);
      _col.multiplyScalar(0.7);
      wicks.setColorAt(i, _col);
    };

    const flagDirty = () => {
      bodies.instanceMatrix.needsUpdate = true;
      wicks.instanceMatrix.needsUpdate = true;
      if (bodies.instanceColor) bodies.instanceColor.needsUpdate = true;
      if (wicks.instanceColor) wicks.instanceColor.needsUpdate = true;
    };

    const writeAll = () => {
      for (let i = 0; i < count; i += 1) writeCandle(i, data[i], data[i].close, 1);
      flagDirty();
    };

    writeAll(); // fully-formed static composition (reduced-motion baseline)

    return { data, next, bodies, wicks, geo, material, writeCandle, writeAll, flagDirty };
  }, [seed, count, spacing, yScale, tone]);

  useEffect(
    () => () => {
      built.geo.dispose();
      built.material.dispose();
      built.bodies.dispose();
      built.wicks.dispose();
    },
    [built],
  );

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime + phase;
    const cycle = Math.floor(t / period);
    const p = t / period - cycle;

    if (lastCycle.current < 0) {
      lastCycle.current = cycle;
    } else if (cycle !== lastCycle.current) {
      // Advance the market: drop the oldest candle, mint a new one, and
      // rebuild the full instance buffers (O(count), once every few seconds).
      const steps = Math.min(cycle - lastCycle.current, count);
      for (let s = 0; s < steps; s += 1) {
        built.data.shift();
        built.data.push(built.next());
      }
      lastCycle.current = cycle;
      built.writeAll();
    }

    // The newest candle forms: eases toward its close with a fading wobble
    // (its color flips live between silver/red as it crosses the open).
    const c = built.data[count - 1];
    const ease = 1 - (1 - p) ** 3;
    const wobble = Math.sin(t * 6.1) * 0.06 * (1 - p);
    built.writeCandle(count - 1, c, c.open + (c.close - c.open) * ease + wobble, ease);
    built.flagDirty();

    // Conveyor: the whole series slides one slot per period, then snaps
    // back as the data shifts — continuous forward motion.
    conveyor.current.position.x = -p * spacing;
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={conveyor}>
        <primitive object={built.bodies} />
        <primitive object={built.wicks} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Order-book depth walls — cumulative-depth histogram staircases      */
/* flanking the frame; bids silver (left), asks faint red (right)      */
/* ------------------------------------------------------------------ */

const WALL_STEPS = 34;

function SceneDepthWalls({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null!);

  const built = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      metalness: 0.55,
      roughness: 0.5,
      envMapIntensity: 0.35,
    });

    const buildSide = (side: 1 | -1, seed: number, base: THREE.Color) => {
      const rand = seeded(seed);
      const mesh = new THREE.InstancedMesh(geo, material, WALL_STEPS);
      mesh.frustumCulled = false;
      let cum = 0.35 + rand() * 0.3;
      for (let i = 0; i < WALL_STEPS; i += 1) {
        cum += 0.05 + rand() * 0.24; // cumulative depth only grows
        const h = cum * (0.85 + rand() * 0.3);
        const w = 0.9 + rand() * 0.9;
        _pos.set(
          side * (8.4 + i * 0.26 + rand() * 0.7),
          h / 2,
          -2.5 - i * 0.72 - rand() * 0.3,
        );
        _scl.set(w, h, 0.62);
        _mat4.compose(_pos, _quat, _scl);
        mesh.setMatrixAt(i, _mat4);
        _col.copy(base).multiplyScalar(0.75 + rand() * 0.5);
        mesh.setColorAt(i, _col);
      }
      return mesh;
    };

    // Bid wall: monochrome silver. Ask wall: faint red tint (data, kept dim).
    const bids = buildSide(-1, 4101, new THREE.Color(0.5, 0.53, 0.58));
    const asks = buildSide(1, 4102, new THREE.Color(0.4, 0.06, 0.09));
    return { geo, material, bids, asks };
  }, []);

  useEffect(
    () => () => {
      built.geo.dispose();
      built.material.dispose();
      built.bids.dispose();
      built.asks.dispose();
    },
    [built],
  );

  useFrame((state) => {
    if (!animate) return;
    // Subtle order-flow breathing: whole walls scale from the floor.
    group.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 0.35) * 0.03;
  });

  return (
    <group ref={group} position={[0, -2.55, 0]}>
      <primitive object={built.bids} />
      <primitive object={built.asks} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Price-line ribbon — glowing white polyline drawing itself, with     */
/* deterministic sharp drops where a faint red liquidation flash pulses */
/* ------------------------------------------------------------------ */

const RIBBON_PTS = 220;
const RIBBON_SPEED = 1 / 34; // full traversal ≈ 34s
const RIBBON_DROPS = [64, 128, 182];

function SceneRibbon({ animate }: { animate: boolean }) {
  const head = useRef<THREE.Mesh>(null!);
  const headMat = useRef<THREE.MeshBasicMaterial>(null!);
  const flashes = useRef<(THREE.Mesh | null)[]>([]);

  const built = useMemo(() => {
    const rand = seeded(77002);
    const positions = new Float32Array(RIBBON_PTS * 3);
    let y = 0;
    let recover = 0;
    for (let i = 0; i < RIBBON_PTS; i += 1) {
      let dy = (rand() - 0.5) * 0.16 - y * 0.06;
      if (RIBBON_DROPS.includes(i)) {
        dy -= 1.05 + rand() * 0.35; // liquidation candle: sharp drop
        recover = 6;
      } else if (recover > 0) {
        dy += 0.11; // partial recovery
        recover -= 1;
      }
      y += dy;
      positions[i * 3 + 0] = -13 + (i / (RIBBON_PTS - 1)) * 26;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(i * 0.11) * 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({
      color: "#eef0f4",
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const line = new THREE.Line(geo, material);
    line.frustumCulled = false;

    const dropPos = RIBBON_DROPS.map(
      (i) =>
        [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]] as Vec3,
    );
    const endPos = [
      positions[(RIBBON_PTS - 1) * 3],
      positions[(RIBBON_PTS - 1) * 3 + 1],
      positions[(RIBBON_PTS - 1) * 3 + 2],
    ] as Vec3;

    return { geo, material, line, positions, dropPos, endPos };
  }, []);

  useEffect(
    () => () => {
      built.geo.dispose();
      built.material.dispose();
    },
    [built],
  );

  useFrame((state) => {
    if (!animate) return;
    const p = (state.clock.elapsedTime * RIBBON_SPEED) % 1;
    const headF = p * (RIBBON_PTS - 1);
    const headI = Math.floor(headF);
    const f = headF - headI;

    built.geo.setDrawRange(0, Math.min(RIBBON_PTS, headI + 2));

    // Fade in fast at the start of a pass, fade out before it restarts.
    const env = Math.min(1, p * 24, (1 - p) * 10);
    built.material.opacity = 0.4 * env;

    // Live-price beacon at the drawing head.
    const i0 = headI * 3;
    const i1 = Math.min(headI + 1, RIBBON_PTS - 1) * 3;
    const pts = built.positions;
    head.current.position.set(
      pts[i0] + (pts[i1] - pts[i0]) * f,
      pts[i0 + 1] + (pts[i1 + 1] - pts[i0 + 1]) * f,
      pts[i0 + 2] + (pts[i1 + 2] - pts[i0 + 2]) * f,
    );
    headMat.current.opacity = 0.85 * env;

    // Faint red liquidation pulse as the head passes each sharp drop.
    for (let k = 0; k < RIBBON_DROPS.length; k += 1) {
      const mesh = flashes.current[k];
      if (!mesh) continue;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const d = headF - RIBBON_DROPS[k];
      if (d > 0 && d < 9) {
        const s = 1 - d / 9;
        mat.opacity = 0.28 * s * s * env;
        mesh.scale.setScalar(0.7 + (1 - s) * 1.4);
      } else {
        mat.opacity = 0;
      }
    }
  });

  return (
    <group position={[0, 1.2, -8.5]}>
      <primitive object={built.line} />
      <mesh ref={head} position={built.endPos}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshBasicMaterial
          ref={headMat}
          color="#f4f5f7"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {built.dropPos.map((dp, i) => (
        <mesh
          key={i}
          position={dp}
          ref={(el) => {
            flashes.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshBasicMaterial
            color="#ff2b3f"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}


/* ------------------------------------------------------------------ */
/* Camera rig — slow drift driven by time + scroll progress            */
/* ------------------------------------------------------------------ */

function SceneCameraRig({ animate, scrollRef }: { animate: boolean; scrollRef: ScrollRef }) {
  const look = useMemo(() => new THREE.Vector3(0, 0.35, -6), []);

  useFrame((state) => {
    const cam = state.camera;
    if (!animate) {
      cam.lookAt(look);
      return;
    }
    const t = state.clock.elapsedTime;
    const s = scrollRef.current;

    const tx = Math.sin(t * 0.05) * 0.55 + Math.sin(s * Math.PI * 2) * 0.35;
    const ty = 1.9 + Math.sin(t * 0.04) * 0.15 - s * 0.9;
    const tz = 9.5 - s * 1.2;

    cam.position.x += (tx - cam.position.x) * 0.02;
    cam.position.y += (ty - cam.position.y) * 0.02;
    cam.position.z += (tz - cam.position.z) * 0.02;

    look.y = 0.35 - s * 0.5;
    cam.lookAt(look);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

export default function ArenaScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hidden, setHidden] = useState(false);
  const scrollRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const animate = !reducedMotion && !hidden;

  return (
    <div className="h-full w-full bg-[#050505]">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={animate ? "always" : "demand"}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 2, 9.5], fov: 42, near: 0.1, far: 80 }}
      >
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 7, 30]} />

        <ambientLight intensity={0.14} />
        <directionalLight position={[4, 8, 2]} intensity={0.5} color="#eef0f3" />

        <SceneCameraRig animate={animate} scrollRef={scrollRef} />

        {/* Main candlestick skyline through the mid-ground. */}
        <SceneCandleChart
          seed={90211}
          count={96}
          spacing={0.34}
          yScale={0.85}
          tone={1}
          period={3.4}
          phase={0}
          position={[0.4, -0.55, -7.2]}
          rotationY={-0.14}
          animate={animate}
        />
        {/* Second, fainter series deeper in the fog — a market behind the market. */}
        <SceneCandleChart
          seed={31877}
          count={72}
          spacing={0.55}
          yScale={1.15}
          tone={0.75}
          period={4.7}
          phase={7.3}
          position={[-2.5, 0.9, -17]}
          rotationY={0.3}
          animate={animate}
        />

        <SceneDepthWalls animate={animate} />
        <SceneRibbon animate={animate} />
        {/* Procedural monochrome studio lighting for metallic candle specular. */}
        <Environment resolution={64} frames={1}>
          <Lightformer
            form="rect"
            intensity={1.1}
            color="#ffffff"
            position={[0, 6, -8]}
            scale={[12, 6, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.5}
            color="#dfe3e8"
            position={[-8, 2, 2]}
            rotation-y={Math.PI / 2}
            scale={[9, 2, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.55}
            color="#f2f4f6"
            position={[8, 1, -1]}
            rotation-y={-Math.PI / 2}
            scale={[9, 2, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}
