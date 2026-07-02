"use client";

/**
 * ArenaScene — ambient monochrome 3D layer for the Trading Arena 2026 deck.
 *
 * Composition (strictly black / grey / silver, zero color):
 *   - A vast wireframe market-depth terrain (order-book ridges) receding into
 *     pure-black fog across the lower third of the frame.
 *   - A tilted pair of chrome rings drifting on the right edge, lit by a
 *     procedural monochrome Environment (Lightformers) for liquid-metal specular.
 *   - Sparse metallic shards along the left/right edges.
 *   - ~1600 additive "data dust" particles.
 *
 * Scroll progress (0..1) gently drives camera drift + terrain phase.
 * prefers-reduced-motion → static frame (frameloop="demand", no mutations).
 * Hidden tab → rendering paused via frameloop="demand".
 */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";

type ScrollRef = { current: number };

/* Deterministic PRNG so the shard/dust layout is stable across remounts. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Terrain — wireframe market-depth grid, displaced in the vertex shader */
/* ------------------------------------------------------------------ */

const TERRAIN_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  varying float vGlow;
  varying float vFade;
  varying float vDist;

  float ridge(float x) {
    float s = abs(sin(x));
    return s * s * s * s;
  }

  void main() {
    vec3 p = position;
    vec2 q = p.xy;
    float t = uTime * 0.5;

    // Layered swells + sharp order-book ridges.
    float h = 0.0;
    h += sin(q.x * 0.32 + t * 0.45 + uPhase * 1.3) * 0.42;
    h += sin(q.y * 0.24 - t * 0.33 + uPhase * 0.7) * 0.38;
    h += sin((q.x + q.y * 0.55) * 0.16 + t * 0.21) * 0.55;
    h += ridge(q.x * 0.11 + t * 0.10 + uPhase * 0.5) * 1.5;
    h += ridge(q.y * 0.09 - t * 0.08 + 1.7) * 1.15;

    // Calm near the camera / center, tall peaks toward horizon and edges
    // so slide copy always sits over near-black.
    float far = smoothstep(-8.0, 22.0, q.y);
    float side = smoothstep(5.0, 26.0, abs(q.x));
    h *= mix(0.3, 1.0, far) * (1.0 + side * 0.9);
    h += side * far * 0.6;

    p.z += h;

    vGlow = h;
    vFade = (1.0 - smoothstep(22.0, 31.5, abs(q.x)))
          * (1.0 - smoothstep(13.0, 22.5, -q.y));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDist = length(mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const TERRAIN_FRAGMENT = /* glsl */ `
  varying float vGlow;
  varying float vFade;
  varying float vDist;

  void main() {
    float fog = 1.0 - smoothstep(7.0, 29.0, vDist);
    float lum = 0.10 + clamp(vGlow, 0.0, 2.6) * 0.085;
    float a = fog * vFade;
    if (a < 0.015) discard;
    gl_FragColor = vec4(vec3(lum), a);
  }
`;

function SceneTerrain({ animate, scrollRef }: { animate: boolean; scrollRef: ScrollRef }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: TERRAIN_VERTEX,
        fragmentShader: TERRAIN_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uPhase: { value: 0 },
        },
        wireframe: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  const phase = useRef(0);

  useFrame((state) => {
    if (!animate) return;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    const target = scrollRef.current * 5.0;
    phase.current += (target - phase.current) * 0.04;
    material.uniforms.uPhase.value = phase.current;
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2.4, -10]}
      material={material}
      frustumCulled={false}
    >
      <planeGeometry args={[64, 46, 128, 96]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Chrome rings — slow metallic centerpiece off-center on the right    */
/* ------------------------------------------------------------------ */

function SceneChromeRings({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.x = 0.9 + Math.sin(t * 0.07) * 0.12;
    group.current.rotation.z = t * 0.04;
    group.current.position.y = 0.8 + Math.sin(t * 0.16) * 0.18;
    inner.current.rotation.z = -t * 0.09;
  });

  return (
    <group ref={group} position={[3.8, 0.8, -5]} rotation={[0.9, 0.35, 0]}>
      <mesh>
        <torusGeometry args={[2.7, 0.055, 20, 180]} />
        <meshStandardMaterial
          color="#b9bec6"
          metalness={1}
          roughness={0.22}
          envMapIntensity={0.8}
        />
      </mesh>
      <mesh ref={inner} rotation={[0.6, 0, 0]}>
        <torusGeometry args={[1.85, 0.035, 16, 140]} />
        <meshStandardMaterial
          color="#8d939b"
          metalness={1}
          roughness={0.3}
          envMapIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Shard field — sparse metallic fragments along the frame edges       */
/* ------------------------------------------------------------------ */

const SHARD_COUNT = 9;

type Shard = {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: [number, number, number];
  speed: number;
  offset: number;
};

function SceneShardField({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null!);

  const shards = useMemo<Shard[]>(() => {
    const rand = seeded(1337);
    return Array.from({ length: SHARD_COUNT }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return {
        pos: [side * (4.5 + rand() * 3.5), -1 + rand() * 4, -9 + rand() * 7] as [
          number,
          number,
          number,
        ],
        rot: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI] as [
          number,
          number,
          number,
        ],
        scale: [0.35 + rand() * 0.5, 0.7 + rand() * 0.9, 0.14 + rand() * 0.12] as [
          number,
          number,
          number,
        ],
        speed: 0.15 + rand() * 0.2,
        offset: rand() * Math.PI * 2,
      };
    });
  }, []);

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const s = shards[i];
      child.rotation.x = s.rot[0] + t * s.speed * 0.5;
      child.rotation.y = s.rot[1] + t * s.speed;
      child.position.y = s.pos[1] + Math.sin(t * 0.25 + s.offset) * 0.3;
    });
  });

  return (
    <group ref={group}>
      {shards.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot} scale={s.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#a6abb3"
            metalness={1}
            roughness={0.18}
            envMapIntensity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Data dust — sparse additive particles                               */
/* ------------------------------------------------------------------ */

const DUST_COUNT = 1600;

function SceneDataDust({ animate }: { animate: boolean }) {
  const points = useRef<THREE.Points>(null!);

  const geometry = useMemo(() => {
    const rand = seeded(20260701);
    const positions = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i += 1) {
      positions[i * 3 + 0] = (rand() - 0.5) * 34;
      positions[i * 3 + 1] = -2.2 + rand() * 9;
      positions[i * 3 + 2] = -20 + rand() * 24;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime;
    points.current.rotation.y = t * 0.008;
    points.current.position.y = Math.sin(t * 0.05) * 0.4;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color="#dfe2e7"
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Camera rig — slow drift driven by time + scroll progress            */
/* ------------------------------------------------------------------ */

function SceneCameraRig({ animate, scrollRef }: { animate: boolean; scrollRef: ScrollRef }) {
  const look = useMemo(() => new THREE.Vector3(0, 0.55, -5), []);

  useFrame((state) => {
    const cam = state.camera;
    if (!animate) {
      cam.lookAt(look);
      return;
    }
    const t = state.clock.elapsedTime;
    const s = scrollRef.current;

    const tx = Math.sin(t * 0.05) * 0.55 + Math.sin(s * Math.PI * 2) * 0.35;
    const ty = 2.0 + Math.sin(t * 0.04) * 0.15 - s * 0.9;
    const tz = 9.5 - s * 1.2;

    cam.position.x += (tx - cam.position.x) * 0.02;
    cam.position.y += (ty - cam.position.y) * 0.02;
    cam.position.z += (tz - cam.position.z) * 0.02;

    look.y = 0.55 - s * 0.5;
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

        <ambientLight intensity={0.12} />
        <directionalLight position={[4, 8, 2]} intensity={0.35} color="#eef0f3" />

        <SceneCameraRig animate={animate} scrollRef={scrollRef} />
        <SceneTerrain animate={animate} scrollRef={scrollRef} />
        <SceneChromeRings animate={animate} />
        <SceneShardField animate={animate} />
        <SceneDataDust animate={animate} />

        {/* Procedural monochrome studio lighting for the chrome elements. */}
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
          <Lightformer
            form="ring"
            intensity={0.35}
            color="#ffffff"
            position={[0, -4, 4]}
            scale={6}
          />
        </Environment>
      </Canvas>
    </div>
  );
}
