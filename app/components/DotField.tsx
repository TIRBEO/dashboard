import { useEffect, useRef, memo } from 'react';
import './DotField.css';

const TWO_PI = Math.PI * 2;

interface DotFieldProps {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  bulgeStrength?: number;
  waveAmplitude?: number;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
}

const DotField = memo(({
  dotRadius = 2.5,
  dotSpacing = 8,
  cursorRadius = 250,
  bulgeStrength = 25,
  waveAmplitude = 0.6,
  gradientFrom = 'rgba(255, 255, 255, 0.4)',
  gradientTo = 'rgba(255, 255, 255, 0.15)',
  className = '',
}: DotFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<{ ax: number; ay: number; sx: number; sy: number }[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const propsRef = useRef({ dotRadius, dotSpacing, cursorRadius, bulgeStrength, waveAmplitude, gradientFrom, gradientTo });
  propsRef.current = { dotRadius, dotSpacing, cursorRadius, bulgeStrength, waveAmplitude, gradientFrom, gradientTo };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let resizeTimer: ReturnType<typeof setTimeout>;

    function doResize() {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
      buildDots(w, h);
    }

    function resize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(doResize, 60);
    }

    function buildDots(w: number, h: number) {
      const p = propsRef.current;
      const step = p.dotRadius * 2 + p.dotSpacing;
      const cols = Math.ceil(w / step) + 1;
      const rows = Math.ceil(h / step) + 1;
      const padX = (w - (cols - 1) * step) / 2;
      const padY = (h - (rows - 1) * step) / 2;
      const dots = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step;
          const ay = padY + row * step;
          dots.push({ ax, ay, sx: ax, sy: ay });
        }
      }
      dotsRef.current = dots;
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.parentElement!.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }

    let frameCount = 0;

    function tick() {
      frameCount++;
      const dots = dotsRef.current;
      const m = mouseRef.current;
      const { w, h } = sizeRef.current;
      const p = propsRef.current;
      const len = dots.length;
      const t = frameCount * 0.012;
      const cr = p.cursorRadius;
      const crSq = cr * cr;
      const rad = p.dotRadius;

      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, p.gradientFrom);
      grad.addColorStop(1, p.gradientTo);
      ctx.fillStyle = grad;

      ctx.beginPath();

      for (let i = 0; i < len; i++) {
        const d = dots[i];
        const dx = m.x - d.ax;
        const dy = m.y - d.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < crSq) {
          const dist = Math.sqrt(distSq);
          const falloff = 1 - dist / cr;
          const push = falloff * falloff * p.bulgeStrength;
          const angle = Math.atan2(dy, dx);
          d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
          d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
        } else {
          d.sx += (d.ax - d.sx) * 0.06;
          d.sy += (d.ay - d.sy) * 0.06;
        }

        let drawX = d.sx;
        let drawY = d.sy;

        if (p.waveAmplitude > 0) {
          drawY += Math.sin(d.ax * 0.015 + t) * p.waveAmplitude;
          drawX += Math.cos(d.ay * 0.015 + t * 0.7) * p.waveAmplitude * 0.4;
        }

        ctx.moveTo(drawX + rad, drawY);
        ctx.arc(drawX, drawY, rad, 0, TWO_PI);
      }

      ctx.fill();
      rafRef.current = requestAnimationFrame(tick);
    }

    doResize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useEffect(() => {
    const { w, h } = sizeRef.current;
    if (w > 0 && h > 0) {
      const p = propsRef.current;
      const step = p.dotRadius * 2 + p.dotSpacing;
      const cols = Math.ceil(w / step) + 1;
      const rows = Math.ceil(h / step) + 1;
      const padX = (w - (cols - 1) * step) / 2;
      const padY = (h - (rows - 1) * step) / 2;
      const dots = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          dots.push({ ax: padX + col * step, ay: padY + row * step, sx: padX + col * step, sy: padY + row * step });
        }
      }
      dotsRef.current = dots;
    }
  }, [dotRadius, dotSpacing]);

  return (
    <div className={`dot-field-container ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
});

DotField.displayName = 'DotField';
export default DotField;
