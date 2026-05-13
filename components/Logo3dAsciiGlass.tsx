"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, MeshTransmissionMaterial, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";
import PrismBackground from "./backgrounds/PrismBackground";

const DESKTOP_SRC = "https://api.grove.storage/00e8205c3ac1af52b8d08d98cc748383cb9f57f53182a955be8994f49e909cdd";
const MOBILE_SRC  = "https://api.grove.storage/b64a987a591ff41d25e635b9e59ffbec6c6e4a8f9982f2a7122c2d6db3fcfe41";

function createVideoTexture(src: string): { texture: THREE.VideoTexture; video: HTMLVideoElement } {
  const video = document.createElement("video");
  video.src = src;
  video.crossOrigin = "anonymous";
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.style.display = "none";
  document.body.appendChild(video);
  void video.play().catch(() => {});
  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, video };
}

function GlassLogo({
  groupRef,
  scale,
}: {
  groupRef: React.RefObject<THREE.Group>;
  scale: number;
}) {
  const { nodes } = useGLTF("/models/logo.glb");
  const meshes = useMemo(
    () => Object.values(nodes).filter((n) => (n as THREE.Mesh).isMesh) as THREE.Mesh[],
    [nodes],
  );

  return (
    <group ref={groupRef} scale={scale}>
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
  );
}

function AsciiInjector({
  onEffect,
  onLoaded,
  groupRef,
  controlsRef,
}: {
  onEffect: (effect: AsciiEffect) => void;
  onLoaded: () => void;
  groupRef: React.RefObject<THREE.Group>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { gl, scene, camera, size } = useThree();
  const { width, height } = size;
  const effectRef = useRef<AsciiEffect | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRotate = useRef(true);
  const onEffectRef = useRef(onEffect);
  const onLoadedRef = useRef(onLoaded);

  useEffect(() => {
    onEffectRef.current = onEffect;
  }, [onEffect]);

  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  useEffect(() => {
    onLoadedRef.current();
  }, []);

  useEffect(() => {
    const effect = new AsciiEffect(gl, " .:-+*=%@#", { invert: true });
    effect.setSize(width, height);
    effect.domElement.style.color = "white";
    effect.domElement.style.backgroundColor = "transparent";
    effect.domElement.style.position = "absolute";
    effect.domElement.style.inset = "0";
    effect.domElement.style.width = "100%";
    effect.domElement.style.height = "100%";
    effect.domElement.style.fontFamily = "monospace";
    effect.domElement.style.fontSize = "9px";
    effect.domElement.style.pointerEvents = "none";
    effectRef.current = effect;
    onEffectRef.current(effect);

    return () => {
      effectRef.current = null;
    };
  }, [gl, width, height]);

  useEffect(() => {
    if (!effectRef.current) return;
    effectRef.current.setSize(width, height);
  }, [width, height]);

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate.current) {
      groupRef.current.rotation.y += delta * 0.55;
    }
    if (effectRef.current) {
      effectRef.current.render(scene, camera);
    }
  }, 1);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const onStart = () => {
      autoRotate.current = false;
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
    const onEnd = () => {
      idleTimer.current = setTimeout(() => { autoRotate.current = true; }, 2000);
    };
    controls.addEventListener("start", onStart);
    controls.addEventListener("end", onEnd);
    return () => {
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [controlsRef]);

  return null;
}

function VideoBackground({ texture }: { texture: THREE.VideoTexture }) {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = texture;
    return () => { scene.background = null; };
  }, [scene, texture]);
  return null;
}

function Scene({
  onEffect,
  onLoaded,
  videoTexture,
  logoScale,
}: {
  onEffect: (effect: AsciiEffect) => void;
  onLoaded: () => void;
  videoTexture: THREE.VideoTexture | null;
  logoScale: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        minDistance={2}
        maxDistance={12}
      />
      <ambientLight intensity={5} />
      <directionalLight position={[4, 5, 6]} intensity={1.5} />
      {videoTexture ? <VideoBackground texture={videoTexture} /> : null}
      <GlassLogo groupRef={groupRef} scale={logoScale} />
      <AsciiInjector
        onEffect={onEffect}
        onLoaded={onLoaded}
        groupRef={groupRef}
        controlsRef={controlsRef}
      />
    </>
  );
}

export default function Logo3dAsciiGlass() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  const [logoScale, setLogoScale] = useState(4.5);
  const asciiContainerRef = useRef<HTMLDivElement>(null);
  const asciiEffectRef = useRef<AsciiEffect | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateScale = () => {
      setLogoScale(mediaQuery.matches ? 6.3 : 4.5);
    };

    updateScale();
    mediaQuery.addEventListener("change", updateScale);
    return () => {
      mediaQuery.removeEventListener("change", updateScale);
    };
  }, []);

  useEffect(() => {
    const isMobile = !window.matchMedia("(min-width: 768px)").matches;
    const src = isMobile ? MOBILE_SRC : DESKTOP_SRC;
    const { texture, video } = createVideoTexture(src);
    setVideoTexture(texture);
    return () => {
      texture.dispose();
      video.pause();
      video.remove();
    };
  }, []);

  const handleEffect = (effect: AsciiEffect) => {
    asciiEffectRef.current = effect;
    if (asciiContainerRef.current) {
      asciiContainerRef.current.appendChild(effect.domElement);
    }
  };

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

      <style>{`
        @keyframes caustic-drift {
          0%   { transform: translate(-50%, -50%) scale(1)    rotate(0deg);   opacity: 0.18; }
          25%  { transform: translate(-48%, -52%) scale(1.12) rotate(22deg);  opacity: 0.28; }
          50%  { transform: translate(-52%, -48%) scale(0.94) rotate(45deg);  opacity: 0.14; }
          75%  { transform: translate(-50%, -51%) scale(1.08) rotate(68deg);  opacity: 0.26; }
          100% { transform: translate(-50%, -50%) scale(1)    rotate(90deg);  opacity: 0.18; }
        }
        @keyframes caustic-drift2 {
          0%   { transform: translate(-50%, -50%) scale(1.1)  rotate(90deg);  opacity: 0.12; }
          33%  { transform: translate(-53%, -47%) scale(0.9)  rotate(130deg); opacity: 0.22; }
          66%  { transform: translate(-47%, -53%) scale(1.15) rotate(170deg); opacity: 0.10; }
          100% { transform: translate(-50%, -50%) scale(1.1)  rotate(180deg); opacity: 0.12; }
        }
      `}</style>
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "42%", left: "50%",
          width: "60vw", height: "60vw", maxWidth: 700, maxHeight: 700,
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.22) 0%, rgba(200,220,255,0.10) 35%, transparent 70%)",
          borderRadius: "50%",
          animation: "caustic-drift 8s ease-in-out infinite",
          mixBlendMode: "screen",
          filter: "blur(18px)",
        }} />
        <div style={{
          position: "absolute", top: "46%", left: "50%",
          width: "40vw", height: "40vw", maxWidth: 480, maxHeight: 480,
          background: "radial-gradient(ellipse 60% 40% at center, rgba(180,210,255,0.18) 0%, rgba(255,255,255,0.06) 50%, transparent 70%)",
          borderRadius: "50%",
          animation: "caustic-drift2 11s ease-in-out infinite",
          mixBlendMode: "screen",
          filter: "blur(12px)",
        }} />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.42) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div
        ref={asciiContainerRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          opacity: modelLoaded ? 1 : 0,
          transition: "opacity 700ms ease",
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: modelLoaded ? 1 : 0,
          transform: modelLoaded ? "scale(1)" : "scale(1.04)",
          transition: "opacity 700ms ease, transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 3,
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 55 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent", touchAction: "pan-y" }}
          frameloop="always"
        >
          <Suspense fallback={null}>
            <Scene
              onEffect={handleEffect}
              onLoaded={() => setModelLoaded(true)}
              videoTexture={videoTexture}
              logoScale={logoScale}
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
          zIndex: 10,
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
