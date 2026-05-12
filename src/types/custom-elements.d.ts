import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "auto-rotate"?: boolean;
  "auto-rotate-delay"?: string;
  "rotation-per-second"?: string;
  "camera-controls"?: boolean;
  "touch-action"?: string;
  exposure?: string;
  "shadow-intensity"?: string;
  "shadow-softness"?: string;
};

declare module "hydra-synth" {
  const Hydra: any;
  export default Hydra;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerElementProps;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerElementProps;
    }
  }
}

export {};
