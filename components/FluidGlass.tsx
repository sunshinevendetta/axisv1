"use client";

import { Environment, MeshTransmissionMaterial, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Mode = "lens" | "bar" | "cube";

type GlassConfig = {
  modelPath?: string;
  scale?: number;
  ior?: number;
  thickness?: number;
  transmission?: number;
  roughness?: number;
  chromaticAberration?: number;
  anisotropy?: number;
  color?: THREE.ColorRepresentation;
  attenuationColor?: THREE.ColorRepresentation;
  attenuationDistance?: number;
  opacity?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  cameraPosition?: [number, number, number];
  fov?: number;
  floatAmplitude?: number;
  rotationAmplitudeX?: number;
  rotationAmplitudeY?: number;
};

interface FluidGlassProps {
  mode?: Mode;
  lensProps?: GlassConfig;
  barProps?: GlassConfig;
  cubeProps?: GlassConfig;
}

type GlassMesh = {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

const DEFAULT_CONFIG: Record<Mode, GlassConfig> = {
  lens: {
    modelPath: "/assets/3d/lens.glb",
    scale: 0.25,
    ior: 1.15,
    thickness: 5,
    transmission: 1,
    roughness: 0,
    chromaticAberration: 0.1,
    anisotropy: 0.01,
  },
  bar: {
    modelPath: "/assets/3d/bar.glb",
    scale: 1.35,
    ior: 2,
    thickness: 14,
    transmission: 1,
    roughness: 0,
    chromaticAberration: 0.5,
    anisotropy: 0.08,
    color: "#ffffff",
    attenuationColor: "#ffffff",
    attenuationDistance: 8,
    opacity: 0.18,
    position: [0, -0.18, 0],
    rotation: [0, 0, 0],
    cameraPosition: [0, 0, 10],
    fov: 18,
    floatAmplitude: 0.01,
    rotationAmplitudeX: 0.01,
    rotationAmplitudeY: 0.03,
  },
  cube: {
    modelPath: "/assets/3d/cube.glb",
    scale: 0.16,
    ior: 1.35,
    thickness: 8,
    transmission: 1,
    roughness: 0,
    chromaticAberration: 0.08,
    anisotropy: 0.03,
  },
};

export default function FluidGlass({
  mode = "lens",
  lensProps = {},
  barProps = {},
  cubeProps = {},
}: FluidGlassProps) {
  const config = {
    ...DEFAULT_CONFIG[mode],
    ...(mode === "bar" ? barProps : mode === "cube" ? cubeProps : lensProps),
  };

  return (
    <Canvas
      camera={{ position: config.cameraPosition ?? [0, 0, 8], fov: config.fov ?? 28 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[-3, 3, 6]} intensity={2.2} color="#ffffff" />
      <pointLight position={[3, -2, 4]} intensity={1.2} color="#d9d9d9" />
      <spotLight position={[0, 4, 8]} intensity={1.8} angle={0.45} penumbra={1} color="#ffffff" />
      <Environment preset="city" />
      <GlassModel config={config} />
    </Canvas>
  );
}

function GlassModel({ config }: { config: GlassConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(config.modelPath ?? "/assets/3d/bar.glb");

  const meshes = useMemo<GlassMesh[]>(() => {
    const extracted: GlassMesh[] = [];

    scene.updateMatrixWorld(true);
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.geometry) return;

      extracted.push({
        geometry: child.geometry,
        position: [child.position.x, child.position.y, child.position.z],
        rotation: [child.rotation.x, child.rotation.y, child.rotation.z],
        scale: [child.scale.x, child.scale.y, child.scale.z],
      });
    });

    return extracted;
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;
    const baseY = config.position?.[1] ?? 0;
    groupRef.current.rotation.y = Math.sin(t * 0.45) * (config.rotationAmplitudeY ?? 0.18);
    groupRef.current.rotation.x = Math.cos(t * 0.35) * (config.rotationAmplitudeX ?? 0.08);
    groupRef.current.position.y = baseY + Math.sin(t * 0.7) * (config.floatAmplitude ?? 0.08);
  });

  return (
    <group
      ref={groupRef}
      position={config.position ?? [0, 0, 0]}
      rotation={config.rotation ?? [0, 0, 0]}
      scale={config.scale ?? 0.1}
    >
      {meshes.map((mesh, index) => (
        <mesh
          key={`${index}-${mesh.geometry.uuid}`}
          geometry={mesh.geometry}
          position={mesh.position}
          rotation={mesh.rotation}
          scale={mesh.scale}
        >
          <MeshTransmissionMaterial
            transmission={config.transmission ?? 1}
            roughness={config.roughness ?? 0}
            thickness={config.thickness ?? 14}
            ior={config.ior ?? 2}
            chromaticAberration={config.chromaticAberration ?? 0.5}
            anisotropy={config.anisotropy ?? 0.08}
            attenuationColor={config.attenuationColor ?? "#ffffff"}
            attenuationDistance={config.attenuationDistance ?? 8}
            opacity={config.opacity ?? 0.2}
            transparent
            backside={false}
            backsideThickness={config.thickness ?? 14}
            samples={6}
            resolution={512}
            color={config.color ?? "#f5f5f5"}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

useGLTF.preload("/assets/3d/bar.glb");
