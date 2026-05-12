import type * as React from "react";

type ModelViewerAttributes = React.HTMLAttributes<HTMLElement> & {
  src?: string;
  alt?: string;
  poster?: string;
  "camera-controls"?: boolean | string;
  "auto-rotate"?: boolean | string;
  ar?: boolean | string;
  "ar-modes"?: string;
  "environment-image"?: string;
  exposure?: string;
  loading?: string;
  style?: React.CSSProperties;
  class?: string;
  "shadow-intensity"?: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React.JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<ModelViewerAttributes, HTMLElement>;
    }
  }
}

export type { ModelViewerAttributes };
