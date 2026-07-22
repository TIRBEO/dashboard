'use client';

import { useEffect, useRef, memo } from 'react';

const TWO_PI = Math.PI * 2;

interface DotFieldProps {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  bulgeStrength?: number;
  waveAmplitude?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowRadius?: number;
  sparkle?: boolean;
}

const DotField = memo(({
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 300,
  bulgeStrength = 24,
  waveAmplitude = 0,
  gradientFrom = 'rgba(0, 122, 204, 0.3)',
  gradientTo = 'rgba(100, 100, 120, 0.08)',
  glowRadius = 180,
  sparkle = false,
}: DotFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;

    function resize() {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }

    let frameCount = 0;

    function tick() {
      frameCount++;
      const m = mouseRef.current;
      const step = dotRadius * 2 + dotSpacing;
      const cols = Math.ceil(width / step) + 1;
      const rows = Math.ceil(height / step) + 1;
      const padX = ((width - (cols - 1) * step) % step) / 2;
      const padY = ((height - (rows - 1) * step) % step) / 2;
      const cr = cursorRadius;
      const crSq = cr * cr;

      ctx.clearRect(0, 0, width, height);
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, gradientFrom);
      grad.addColorStop(1, gradientTo);
      ctx.fillStyle = grad;
      ctx.beginPath();

      for (let row = 0; row < rows; row++) {
        const ay = padY + row * step;
        const dy = m.y - ay;
        const dySq = dy * dy;
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step;
          const dx = m.x - ax;
          const distSq = dx * dx + dySq;
          let drawX = ax;
          let drawY = ay;

          if (distSq < crSq) {
            const dist = Math.sqrt(distSq);
            const falloff = 1 - dist / cr;
            const push = falloff * falloff * bulgeStrength;
            const angle = Math.atan2(dy, dx);
            drawX -= Math.cos(angle) * push;
            drawY -= Math.sin(angle) * push;
          }

          if (waveAmplitude > 0) {
            drawY += Math.sin(drawX * 0.02 + frameCount * 0.015) * waveAmplitude;
          }

          let r = dotRadius;
          if (sparkle) {
            const hash = ((row * cols + col) * 2654435761) ^ (frameCount >> 4);
            if ((hash >>> 0) % 100 < 2) r = dotRadius * 2;
          }

          ctx.moveTo(drawX + r, drawY);
          ctx.arc(drawX, drawY, r, 0, TWO_PI);
        }
      }

      ctx.fill();
      rafRef.current = window.requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [dotRadius, dotSpacing, cursorRadius, bulgeStrength, waveAmplitude, gradientFrom, gradientTo, glowRadius, sparkle]);

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', opacity: 0.85 }} />
    </div>
  );
});

DotField.displayName = 'DotField';
export default DotField;
