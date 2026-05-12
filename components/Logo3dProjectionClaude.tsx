"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createVideoTexture } from "@/src/lib/ar/videoTexture";

const DESKTOP_VIDEO_SRC = "https://api.grove.storage/00e8205c3ac1af52b8d08d98cc748383cb9f57f53182a955be8994f49e909cdd";
const MOBILE_VIDEO_SRC = "https://api.grove.storage/b64a987a591ff41d25e635b9e59ffbec6c6e4a8f9982f2a7122c2d6db3fcfe41";

export default function Logo3dProjectionClaude() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(7, 4, 1);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 1, 0);
    controls.update();

    const isMobile = !window.matchMedia("(min-width: 768px)").matches;
    const { texture: projectionTexture, video } = createVideoTexture(
      isMobile ? MOBILE_VIDEO_SRC : DESKTOP_VIDEO_SRC,
    );
    video.muted = true;
    video.loop = true;
    video.preload = "auto";
    video.load();
    void video.play().catch(() => {});

    const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.25);
    scene.add(ambient);

    const spotLight = new THREE.SpotLight(0xffffff, 100);
    spotLight.name = "spotLight";
    spotLight.map = projectionTexture;
    spotLight.position.set(2.5, 5, 2.5);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 1;
    spotLight.decay = 2;
    spotLight.distance = 0;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 2;
    spotLight.shadow.camera.far = 10;
    spotLight.shadow.focus = 1;
    spotLight.shadow.bias = -0.003;
    scene.add(spotLight);
    scene.add(spotLight.target);

    const lightHelper = new THREE.SpotLightHelper(spotLight);
    lightHelper.visible = false;
    scene.add(lightHelper);

    const shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
    shadowCameraHelper.visible = false;
    scene.add(shadowCameraHelper);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshLambertMaterial({ color: 0xbcbcbc }),
    );
    plane.position.set(0, -1, 0);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    const stage = new THREE.Group();
    stage.position.y = 0.8;
    stage.rotation.y = -Math.PI / 2;
    scene.add(stage);

    const loader = new GLTFLoader();
    loader.load(
      "/models/logo.glb",
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = true;
          child.receiveShadow = true;
          child.material = new THREE.MeshLambertMaterial({ color: 0xf3f3f3 });
        });

        const bounds = new THREE.Box3().setFromObject(gltf.scene);
        const size = bounds.getSize(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z) || 1;
        const scale = 3.2 / maxAxis;
        gltf.scene.scale.setScalar(scale);

        bounds.setFromObject(gltf.scene);
        const centered = bounds.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(centered);
        stage.add(gltf.scene);
      },
      undefined,
      (error) => {
        console.error("Failed to load projection logo model.", error);
      },
    );

    const clock = new THREE.Clock();

    const onResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", onResize);

    let frameId = 0;
    const animate = () => {
      const time = clock.getElapsedTime() / 3;
      spotLight.position.x = Math.cos(time) * 2.5;
      spotLight.position.z = Math.sin(time) * 2.5;
      lightHelper.update();
      controls.update();
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(frameId);
      controls.dispose();
      projectionTexture.dispose();
      video.pause();
      video.removeAttribute("src");
      video.load();
      lightHelper.dispose();
      shadowCameraHelper.dispose();
      renderer.dispose();
      plane.geometry.dispose();
      (plane.material as THREE.Material).dispose();
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
          return;
        }
        child.material.dispose();
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    />
  );
}
