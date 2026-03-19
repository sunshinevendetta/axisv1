import * as THREE from "three";

export function createVideoTexture(src: string): {
  texture: THREE.VideoTexture;
  video: HTMLVideoElement;
} {
  const video = document.createElement("video");
  video.src = src;
  video.crossOrigin = "anonymous";
  video.loop = true;
  video.muted = true;
  video.preload = "auto";
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  texture.colorSpace = THREE.SRGBColorSpace;

  return { texture, video };
}
