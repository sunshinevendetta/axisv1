"use client";

import GradualBlur from "@/components/GradualBlur";

export default function PageGradualBlur() {
  return (
    <GradualBlur
      position="bottom"
      target="page"
      height="6rem"
      strength={1.5}
      divCount={7}
      curve="ease-out"
      zIndex={48}
      opacity={0.7}
    />
  );
}
