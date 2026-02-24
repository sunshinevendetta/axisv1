'use client';

import { useEffect, useRef, useState } from 'react';
import FloatingLines from "../FloatingLines";

export default function FloatingLinesBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    console.log('[FloatingLinesBG] Container ready, size:', 
      containerRef.current.clientWidth, 'x', containerRef.current.clientHeight);

    const resize = () => {
      if (!containerRef.current) return;
      console.log('[FloatingLinesBG] Resize triggered:', 
        containerRef.current.clientWidth, 'x', containerRef.current.clientHeight);
      // FloatingLines likely handles resize internally via Three.js renderer
      // If not, you would call renderer.setSize(width, height) here
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-black w-full h-full"
    >
      <FloatingLines
        linesGradient={["#f5f5f5", "#676c7e", "#f5f4f5"]}
        animationSpeed={3}
        interactive
        bendRadius={1}
        bendStrength={-1.9}
        mouseDamping={0.05}
        parallax
        parallaxStrength={0.2}
      />
    </div>
  );
}