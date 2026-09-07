import React, { useEffect, useRef } from 'react';

interface PixelSnowProps {
  density?: number;
  speed?: number;
  size?: number;
  color?: string;
}

export const PixelSnow: React.FC<PixelSnowProps> = ({
  density = 50,
  speed = 1,
  size = 2,
  color = 'rgba(57, 255, 20, 0.15)', // Electric lime with low opacity
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; s: number; v: number; offset: number }[] = [];
    let animationFrameId: number;
    
    // Track mouse for subtle reactivity
    let mouseX = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1; // -1 to 1
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / (100000 / density));
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          s: Math.floor(Math.random() * size) + 1, // Ensure integer pixel sizes
          v: Math.random() * speed + 0.2,
          offset: Math.random() * 100,
        });
      }
    };

    let isVisible = true;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    });
    observer.observe(canvas);

    const draw = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      particles.forEach((p) => {
        p.y += p.v;
        p.x += Math.sin(p.y / 150 + p.offset) * 0.3 + (mouseX * 0.5);

        if (p.y > canvas.height) {
          p.y = -p.s;
          p.x = Math.random() * canvas.width;
        }
        
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;

        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.s, p.s);
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();
    draw();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, speed, size, color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
};
