"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import PrismBackground from "./backgrounds/PrismBackground";
export default function Logo3dAscii() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;

    // Camera
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
    camera.position.set(0, 0, 6);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const pointLight1 = new THREE.PointLight(0xffffff, 3, 0, 0);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0xffffff, 1, 0, 0);
    pointLight2.position.set(-5, -5, -5);
    scene.add(pointLight2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);

    // ASCII Effect
    const effect = new AsciiEffect(renderer, " .:-+*=%@#", { invert: true });
    effect.setSize(w, h);
    effect.domElement.style.color = "white";
    effect.domElement.style.backgroundColor = "transparent";
    effect.domElement.style.position = "absolute";
    effect.domElement.style.inset = "0";
    effect.domElement.style.width = "100%";
    effect.domElement.style.height = "100%";
    effect.domElement.style.fontFamily = "monospace";
    effect.domElement.style.fontSize = "10px";
    container.appendChild(effect.domElement);

    // Controls
    const controls = new OrbitControls(camera, effect.domElement);
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 12;

    // Auto-rotate
    let autoRotate = true;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const group = new THREE.Group();
    scene.add(group);

    controls.addEventListener("start", () => {
      autoRotate = false;
      if (idleTimer) clearTimeout(idleTimer);
    });
    controls.addEventListener("end", () => {
      idleTimer = setTimeout(() => { autoRotate = true; }, 2000);
    });

    // Load GLB
    const loader = new GLTFLoader();
    loader.load("/models/logo.glb", (gltf) => {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });
        }
      });
      gltf.scene.scale.setScalar(4.5);
      group.add(gltf.scene);
    });

    // Animation loop
    let animId: number;
    let lastTs: number | null = null;

    const animate = (ts: number) => {
      animId = requestAnimationFrame(animate);
      const delta = lastTs !== null ? (ts - lastTs) / 1000 : 0;
      lastTs = ts;
      if (autoRotate) group.rotation.y += delta * 0.28;
      controls.update();
      effect.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    // Resize
    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      effect.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      if (idleTimer) clearTimeout(idleTimer);
      if (container.contains(effect.domElement)) container.removeChild(effect.domElement);
    };
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden" }}>
      <PrismBackground />
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "transparent", overflow: "hidden" }}
      />
    </div>
  );
}
