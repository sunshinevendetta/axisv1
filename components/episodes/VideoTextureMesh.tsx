"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TextureLoader, Mesh, MeshBasicMaterial, MeshStandardMaterial, SRGBColorSpace, Texture, RepeatWrapping } from "three";
import { useGLTF } from "@react-three/drei";
import { createVideoTexture } from "@/src/lib/ar/videoTexture";
import type { EpisodeAsset } from "@/src/types/episode";

type Props = {
  asset: EpisodeAsset;
  playing: boolean;
  visible: boolean;
  onVideoReadyChange?: (ready: boolean) => void;
  onVideoError?: () => void;
};

function canReceiveTexture(material: THREE.Material): material is MeshBasicMaterial | MeshStandardMaterial {
  return material instanceof MeshBasicMaterial || material instanceof MeshStandardMaterial;
}

function applyTextureTransform(texture: Texture, options?: EpisodeAsset["videoTexture"]) {
  if (!options) return;

  texture.center.set(0.5, 0.5);

  if (options.flipX) {
    texture.wrapS = RepeatWrapping;
    texture.repeat.x = -1;
    texture.offset.x = 1;
  }

  if (options.flipY) {
    texture.wrapT = RepeatWrapping;
    texture.repeat.y = -1;
    texture.offset.y = 1;
  }

  texture.needsUpdate = true;
}

function applyTextureToScene(scene: THREE.Object3D, texture: Texture, meshTarget?: string) {
  let applied = false;

  scene.traverse((child) => {
    if (!(child instanceof Mesh)) return;

    const isTarget = meshTarget ? child.name === meshTarget : !applied;
    if (!isTarget) return;

    const materials: THREE.Material[] = Array.isArray(child.material) ? child.material : [child.material];
    const nextMaterials = materials.map((material) => {
      if (!canReceiveTexture(material)) return material;
      if (material.userData.__episodeClone === true) {
        material.dispose();
      }
      const clonedMaterial = material.clone();
      clonedMaterial.userData.__episodeClone = true;
      clonedMaterial.map = texture;
      clonedMaterial.needsUpdate = true;
      return clonedMaterial;
    });

    child.material = Array.isArray(child.material) ? nextMaterials : nextMaterials[0];
    applied = true;
  });
}

function disposeClonedMaterials(scene: THREE.Object3D) {
  scene.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (material instanceof MeshBasicMaterial || material instanceof MeshStandardMaterial) {
        material.dispose();
      }
    }
  });
}

export function VideoTextureMesh({ asset, playing, visible, onVideoReadyChange, onVideoError }: Props) {
  const { scene } = useGLTF(asset.modelUrl || "/assets/3d/bar.glb");
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textureRef = useRef<Texture | null>(null);
  const [hasVideoTexture, setHasVideoTexture] = useState(false);

  useEffect(() => {
    let mounted = true;
    const cleanup: Array<() => void> = [];
    const fallbackTexture = asset.posterUrl ? new TextureLoader().load(asset.posterUrl) : null;

    if (fallbackTexture) {
      fallbackTexture.colorSpace = SRGBColorSpace;
      applyTextureTransform(fallbackTexture, asset.videoTexture);
      applyTextureToScene(clonedScene, fallbackTexture, asset.meshTarget);
      textureRef.current = fallbackTexture;
    }

    if (!asset.videoUrl) {
      onVideoReadyChange?.(false);
      return () => {
        fallbackTexture?.dispose();
        disposeClonedMaterials(clonedScene);
      };
    }

    const { texture, video } = createVideoTexture(asset.videoUrl);
    applyTextureTransform(texture, asset.videoTexture);
    videoRef.current = video;

    const handleCanPlay = () => {
      if (!mounted) return;
      setHasVideoTexture(true);
      onVideoReadyChange?.(true);
      if (textureRef.current && textureRef.current !== texture) {
        textureRef.current.dispose();
      }
      textureRef.current = texture;
      applyTextureToScene(clonedScene, texture, asset.meshTarget);
    };

    const handleError = () => {
      if (!mounted) return;
      setHasVideoTexture(false);
      onVideoReadyChange?.(false);
      onVideoError?.();
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    video.load();

    cleanup.push(() => video.removeEventListener("canplay", handleCanPlay));
    cleanup.push(() => video.removeEventListener("error", handleError));
    cleanup.push(() => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture.dispose();
    });

    return () => {
      mounted = false;
      for (const fn of cleanup) fn();
      fallbackTexture?.dispose();
      disposeClonedMaterials(clonedScene);
    };
  }, [asset.meshTarget, asset.posterUrl, asset.videoUrl, clonedScene, onVideoError, onVideoReadyChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideoTexture) return;

    if (playing && visible) {
      video.play().catch(() => {
        onVideoReadyChange?.(false);
      });
      return;
    }

    video.pause();
  }, [hasVideoTexture, onVideoReadyChange, playing, visible]);

  return (
    <primitive
      object={clonedScene}
      scale={asset.scale ?? [1, 1, 1]}
      position={asset.position ?? [0, 0, 0]}
      rotation={asset.rotation ?? [0, 0, 0]}
    />
  );
}
