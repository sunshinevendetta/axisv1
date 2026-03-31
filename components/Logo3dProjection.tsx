"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, MeshTransmissionMaterial } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import PrismBackground from "./backgrounds/PrismBackground";
import { createVideoTexture } from "@/src/lib/ar/videoTexture";

const DESKTOP_SRC = "https://api.grove.storage/00e8205c3ac1af52b8d08d98cc748383cb9f57f53182a955be8994f49e909cdd";
const MOBILE_SRC = "https://api.grove.storage/b64a987a591ff41d25e635b9e59ffbec6c6e4a8f9982f2a7122c2d6db3fcfe41";

type ProjectionTextureState = {
  texture: THREE.VideoTexture;
  video: HTMLVideoElement;
};

function ProjectedLogo({ texture }: { texture: THREE.VideoTexture | null }) {
  const { scene } = useThree();
  const { nodes } = useGLTF("/models/logo.glb");
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const logoRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const spotlightTargetRef = useRef<THREE.Object3D>(null);
  const helperRef = useRef<THREE.SpotLightHelper | null>(null);

  const meshes = useMemo(
    () => Object.values(nodes).filter((node) => (node as THREE.Mesh).isMesh) as THREE.Mesh[],
    [nodes],
  );

  useEffect(() => {
    if (!spotlightRef.current) return;
    spotlightRef.current.map = texture;
    spotlightRef.current.needsUpdate = true;
  }, [texture]);

  useEffect(() => {
    if (!spotlightRef.current || !spotlightTargetRef.current) return;
    spotlightRef.current.target = spotlightTargetRef.current;
  }, []);

  useEffect(() => {
    if (!spotlightRef.current) return;
    const helper = new THREE.SpotLightHelper(spotlightRef.current);
    helper.visible = false;
    scene.add(helper);
    helperRef.current = helper;

    return () => {
      scene.remove(helper);
      helper.dispose();
      helperRef.current = null;
    };
  }, [scene]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() / 3;

    if (spotlightRef.current) {
      spotlightRef.current.position.x = Math.cos(time) * 2.5;
      spotlightRef.current.position.z = Math.sin(time) * 2.5;
    }

    if (spotlightTargetRef.current) {
      spotlightTargetRef.current.position.set(0, 0.7, 0);
      spotlightTargetRef.current.updateMatrixWorld();
    }

    if (logoRef.current) {
      logoRef.current.rotation.y += 0.0035;
    }

    helperRef.current?.update();
    controlsRef.current?.update();
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={2}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2}
        target={[0, 1, 0]}
      />

      <hemisphereLight args={["#ffffff", "#8d8d8d", 0.25]} />

      <spotLight
        ref={spotlightRef}
        color="#ffffff"
        intensity={100}
        position={[2.5, 5, 2.5]}
        angle={Math.PI / 6}
        penumbra={1}
        decay={2}
        distance={0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={2}
        shadow-camera-far={10}
        shadow-focus={1}
        shadow-bias={-0.003}
      />
      <object3D ref={spotlightTargetRef} />

      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshLambertMaterial color="#bcbcbc" />
      </mesh>

      <group ref={logoRef} position={[0, 0.8, 0]} rotation={[0, -Math.PI / 2, 0]} scale={4.25}>
        {meshes.map((mesh, index) => (
          <mesh
            key={`${index}-${mesh.uuid}`}
            geometry={mesh.geometry}
            position={mesh.position}
            rotation={mesh.rotation}
            scale={mesh.scale}
            castShadow
            receiveShadow
          >
            <MeshTransmissionMaterial
              backside
              samples={10}
              resolution={1024}
              transmission={1}
              roughness={1}
              thickness={0.001}
              ior={5}
              chromaticAberration={100}
              anisotropicBlur={8}
              distortion={10}
              distortionScale={1.25}
              temporalDistortion={1.3}
              clearcoat={10}
              attenuationColor="#30d8f2"
              attenuationDistance={100.15}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

function ProjectionScene({
  onLoaded,
  projectionTexture,
}: {
  onLoaded: () => void;
  projectionTexture: THREE.VideoTexture | null;
}) {
  useEffect(() => {
    onLoaded();
  }, [onLoaded]);

  return <ProjectedLogo texture={projectionTexture} />;
}

export default function Logo3dProjection() {
  const [loaded, setLoaded] = useState(false);
  const [projectionTexture, setProjectionTexture] = useState<ProjectionTextureState | null>(null);

  useEffect(() => {
    const isMobile = !window.matchMedia("(min-width: 768px)").matches;
    const src = isMobile ? MOBILE_SRC : DESKTOP_SRC;
    const next = createVideoTexture(src);
    next.video.autoplay = true;
    next.video.style.display = "none";
    document.body.appendChild(next.video);
    void next.video.play().catch(() => {});
    setProjectionTexture(next);

    return () => {
      next.texture.dispose();
      next.video.pause();
      next.video.remove();
    };
  }, []);

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
            "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.14) 70%, rgba(0,0,0,0.58) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: loaded ? 1 : 0,
          transform: loaded ? "scale(1)" : "scale(1.03)",
          transition: "opacity 700ms ease, transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 2,
        }}
      >
        <Canvas
          camera={{ position: [7, 4, 1], fov: 40, near: 0.1, far: 100 }}
          shadows
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => {
            gl.setPixelRatio(window.devicePixelRatio);
            gl.toneMapping = THREE.NeutralToneMapping;
            gl.toneMappingExposure = 1;
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFShadowMap;
          }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <ProjectionScene
              onLoaded={() => setLoaded(true)}
              projectionTexture={projectionTexture?.texture ?? null}
            />
          </Suspense>
        </Canvas>
      </div>

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
          zIndex: 3,
          opacity: loaded ? 0 : 1,
          transition: "opacity 700ms ease",
        }}
      >
        loading
      </div>
    </div>
  );
}

useGLTF.preload("/models/logo.glb");
