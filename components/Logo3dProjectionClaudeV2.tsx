"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, video };
}

export default function Logo3dProjectionClaudeV2() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = !window.matchMedia("(min-width: 768px)").matches;
    const src = isMobile ? MOBILE_SRC : DESKTOP_SRC;
    const { texture: videoTexture, video } = createVideoTexture(src);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(7, 4, 1);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 1, 0);
    controls.update();

    // Lights
    const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.25);
    scene.add(ambient);

    const spotLight = new THREE.SpotLight(0xffffff, 100);
    spotLight.name = "spotLight";
    spotLight.map = videoTexture;
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
    spotLight.shadow.intensity = 1;
    scene.add(spotLight);

    // Floor plane
    const planeGeo = new THREE.PlaneGeometry(10, 10);
    const planeMat = new THREE.MeshLambertMaterial({ color: 0xbcbcbc });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.position.set(0, -1, 0);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Load GLB logo model
    const loader = new GLTFLoader();
    loader.load("/models/logo.glb", (gltf) => {
      const model = gltf.scene;

      // Compute bounding box to auto-fit
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Scale so tallest axis fits roughly 2 units
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      model.scale.setScalar(scale);

      // Center and lift above floor
      model.position.set(-center.x * scale, -box.min.y * scale + 0.8 - 1, -center.z * scale);
      model.rotation.y = -Math.PI / 2;

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = new THREE.MeshLambertMaterial();
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      scene.add(model);
    });

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = performance.now() / 3000;
      spotLight.position.x = Math.cos(time) * 2.5;
      spotLight.position.z = Math.sin(time) * 2.5;
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      videoTexture.dispose();
      video.pause();
      video.remove();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
