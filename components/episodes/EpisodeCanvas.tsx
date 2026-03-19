"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";
import { HitTestPlacement } from "@/components/episodes/HitTestPlacement";
import { VideoTextureMesh } from "@/components/episodes/VideoTextureMesh";
import type { EpisodeAsset } from "@/src/types/episode";

export const episodeXRStore = createXRStore({
  requiredFeatures: ["hit-test", "local-floor"],
});

type Props = {
  asset: EpisodeAsset;
  playing: boolean;
  visible: boolean;
  arActive: boolean;
  onVideoReadyChange?: (ready: boolean) => void;
  onVideoError?: () => void;
};

export function EpisodeCanvas({
  asset,
  playing,
  visible,
  arActive,
  onVideoReadyChange,
  onVideoError,
}: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.9, 2.8], fov: 40 }}
      style={{ touchAction: "none" }}
    >
      <XR store={episodeXRStore}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 5, 3]} intensity={1} />
        {!arActive && <Environment preset="studio" />}

        <Suspense fallback={null}>
          {arActive ? (
            <HitTestPlacement>
              <VideoTextureMesh
                asset={asset}
                playing={playing}
                visible={visible}
                onVideoReadyChange={onVideoReadyChange}
                onVideoError={onVideoError}
              />
            </HitTestPlacement>
          ) : (
            <>
              <VideoTextureMesh
                asset={asset}
                playing={playing}
                visible={visible}
                onVideoReadyChange={onVideoReadyChange}
                onVideoError={onVideoError}
              />
              <OrbitControls
                enablePan={false}
                enableZoom
                minDistance={1.4}
                maxDistance={4.4}
                target={[0, 0.15, 0]}
              />
            </>
          )}
        </Suspense>
      </XR>
    </Canvas>
  );
}
