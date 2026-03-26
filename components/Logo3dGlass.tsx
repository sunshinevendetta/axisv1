"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, MeshTransmissionMaterial, Environment, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import PrismBackground from "./backgrounds/PrismBackground";

function BetterLogoGlass() {
  const { nodes } = useGLTF("/models/logo.glb");
  const groupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const meshes = useMemo(
    () => Object.values(nodes).filter((n) => (n as THREE.Mesh).isMesh) as THREE.Mesh[],
    [nodes],
  );

  // Resume auto-rotate 2s after user stops interacting
  const handleStart = () => {
    setAutoRotate(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
  };

  const handleEnd = () => {
    idleTimer.current = setTimeout(() => setAutoRotate(true), 2000);
  };

  useEffect(() => () => { if (idleTimer.current) clearTimeout(idleTimer.current); }, []);

  // Slow idle spin when not being dragged
  useFrame((_, delta) => {
    if (!groupRef.current || !autoRotate) return;
    groupRef.current.rotation.y += delta * 0.28;
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={12}
        onStart={handleStart}
        onEnd={handleEnd}
      />
      <group ref={groupRef} scale={4.5}>
        {meshes.map((mesh, i) => (
          <mesh
            key={i}
            geometry={mesh.geometry}
            position={mesh.position}
            rotation={mesh.rotation}
            scale={mesh.scale}
          >
            <MeshTransmissionMaterial
              backside
              samples={10}
              resolution={1024}
              transmission={1}
              roughness={0}
              thickness={50}
              ior={1.22}
              chromaticAberration={0.6}
              anisotropicBlur={0.08}
              distortion={8}
              distortionScale={0.25}
              temporalDistortion={0.0}
              clearcoat={1}
              attenuationColor="#d9d9d9"
              attenuationDistance={1.15}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

function GlassScene({ onLoaded }: { onLoaded: () => void }) {
  useEffect(() => { onLoaded(); }, [onLoaded]);
  return <BetterLogoGlass />;
}

export default function Logo3DGlass() {
  const [modelLoaded, setModelLoaded] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <PrismBackground />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.42) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: modelLoaded ? 1 : 0,
          transform: modelLoaded ? "scale(1)" : "scale(1.04)",
          transition: "opacity 700ms ease, transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 55 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 5, 6]} intensity={1.5} />
          <Environment preset="city" />
          <Suspense fallback={null}>
            <GlassScene onLoaded={() => setModelLoaded(true)} />
          </Suspense>
        </Canvas>
      </div>

      {/* Progress counter — fades out as logo fades in */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "0.65rem",
          fontFamily: "var(--font-display)",
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.32)",
          userSelect: "none",
          pointerEvents: "none",
          opacity: modelLoaded ? 0 : 1,
          transition: "opacity 700ms ease",
        }}
      >
        loading
      </div>
    </div>
  );
}

useGLTF.preload("/models/logo.glb");
