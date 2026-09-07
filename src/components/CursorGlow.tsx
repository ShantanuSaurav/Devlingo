import React, { useEffect, useRef } from 'react';

export const CursorGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;

    if (isReduced || isCoarse || !glowRef.current) return;

    let rafId: number | null = null;
    let targetX = -1000;
    let targetY = -1000;

    const updateGlow = () => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }
      rafId = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(updateGlow);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <div className="cursor-glow" ref={glowRef} aria-hidden="true" />;
};
