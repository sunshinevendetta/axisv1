"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

type DiscProps = {
  accentColor: string;
  mixtapeIndex: number;
  coverArtUrl?: string;
};

function SolidDisc({ accentColor, mixtapeIndex, coverArtUrl }: DiscProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.MeshStandardMaterial>(null);
  const labelRef = useRef<THREE.MeshStandardMaterial>(null);

  // Update disc body color when mixtape changes
  useEffect(() => {
    if (!bodyRef.current) return;
    const c = new THREE.Color(accentColor);
    bodyRef.current.color = c;
    bodyRef.current.emissive = c;
    bodyRef.current.emissiveIntensity = 0.18;
    bodyRef.current.needsUpdate = true;
  }, [accentColor, mixtapeIndex]);

  // Apply cover art texture to label when available
  useEffect(() => {
    if (!labelRef.current || !coverArtUrl) return;
    const loader = new THREE.TextureLoader();
    loader.load(
      coverArtUrl,
      (texture) => {
        if (!labelRef.current) return;
        texture.colorSpace = THREE.SRGBColorSpace;
        labelRef.current.map = texture;
        labelRef.current.color.set("#ffffff");
        labelRef.current.roughness = 0.45;
        labelRef.current.metalness = 0.05;
        labelRef.current.needsUpdate = true;
      },
      undefined,
      () => {
        // texture failed — stay as dark circle
      },
    );
  }, [coverArtUrl]);

  // Reset label to dark when no cover art
  useEffect(() => {
    if (!labelRef.current || coverArtUrl) return;
    labelRef.current.map = null;
    labelRef.current.color.set("#040404");
    labelRef.current.roughness = 0.95;
    labelRef.current.metalness = 0.1;
    labelRef.current.needsUpdate = true;
  }, [coverArtUrl]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.28;
    groupRef.current.rotation.x = Math.sin(t * 0.14) * 0.07;
  });

  return (
    <group ref={groupRef}>
      {/* Main disc body — metallic, accent-colored */}
      <mesh>
        <cylinderGeometry args={[1.6, 1.6, 0.055, 80]} />
        <meshStandardMaterial
          ref={bodyRef}
          color={accentColor}
          metalness={0.92}
          roughness={0.06}
          envMapIntensity={1.6}
        />
      </mesh>

      {/* Label — shows cover art or stays matte dark */}
      <mesh position={[0, 0.032, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.003, 64]} />
        <meshStandardMaterial
          ref={labelRef}
          color="#040404"
          metalness={0.1}
          roughness={0.95}
        />
      </mesh>

      {/* Center spindle hole */}
      <mesh>
        <cylinderGeometry args={[0.076, 0.076, 0.08, 32]} />
        <meshStandardMaterial color="#000000" metalness={0} roughness={1} />
      </mesh>
    </group>
  );
}

type Props = {
  accentColor: string;
  mixtapeIndex: number;
  coverArtUrl?: string;
};

export default function MixtapeDisc({ accentColor, mixtapeIndex, coverArtUrl }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 3.4], fov: 38 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(0x000000), 0);
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "transparent",
        zIndex: 2,
      }}
    >
      <ambientLight intensity={0.45} />
      <pointLight position={[4, 5, 4]} intensity={4.5} color="#ffffff" />
      <pointLight position={[-3, -2, -3]} intensity={2} color={accentColor} />
      <spotLight position={[0, 6, 2]} angle={0.35} penumbra={0.9} intensity={3} />

      <Suspense fallback={null}>
        <SolidDisc
          accentColor={accentColor}
          mixtapeIndex={mixtapeIndex}
          coverArtUrl={coverArtUrl}
        />
        <Environment preset="city" />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI * 0.65}
        minPolarAngle={Math.PI * 0.28}
        rotateSpeed={0.5}
      />
    </Canvas>
  );
}
