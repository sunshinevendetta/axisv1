"use client";

import { useRef } from "react";
import { useXRHitTest } from "@react-three/xr";
import * as THREE from "three";

type Props = {
  children: React.ReactNode;
};

const matrixHelper = new THREE.Matrix4();

export function HitTestPlacement({ children }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  useXRHitTest((results, getWorldMatrix) => {
    if (!groupRef.current || results.length === 0) return;
    getWorldMatrix(matrixHelper, results[0]);
    matrixHelper.decompose(
      groupRef.current.position,
      groupRef.current.quaternion,
      groupRef.current.scale,
    );
  }, "viewer");

  return <group ref={groupRef}>{children}</group>;
}
