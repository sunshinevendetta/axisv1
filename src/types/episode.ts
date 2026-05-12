export interface EpisodeAssetARConfig {
  enabled: boolean;
  placementMode: "floor" | "wall";
}

export interface EpisodeAsset {
  id: string;
  modelUrl?: string;
  videoUrl?: string;
  posterUrl?: string;
  meshTarget?: string;
  videoTexture?: {
    flipX?: boolean;
    flipY?: boolean;
  };
  scale?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  ar?: EpisodeAssetARConfig;
}
