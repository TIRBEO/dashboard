import { useEffect, useRef } from 'react';

export interface BackgroundProps {
  frameDir?: string;
  frameCount?: number;
}

const currentFrame = (dir: string, index: number) =>
  `${dir}ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

export function preloadFrames(onProgress?: (loaded: number, total: number) => void, frameDir = '/frames/', frameCount = 300) {
  return new Promise<HTMLImageElement[]>((resolve) => {
    const images: HTMLImageElement[] = [];
    let loaded = 0;
    if (frameCount <= 0) { resolve([]); return; }
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.onload = img.onerror = () => {
        // Decode up front so playback never pays decode cost per frame.
        img.decode?.().catch(() => {}).finally(() => {
          loaded++;
          onProgress?.(loaded, frameCount);
          if (loaded >= frameCount) resolve(images);
        });
      };
      img.src = currentFrame(frameDir, i + 1);
      images[i] = img;
    }
  });
}

export function CanvasBackground({ images, frameCount = 300 }: { images: HTMLImageElement[]; frameCount?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const count = frameCount;
    let currentIndex = 0;
    let displayedIndex = -1;
    let raf = 0;

    // Ping-pong playback: frame 1 -> 300 -> 1 -> 300 (like a video), site-wide.
    let autoDir = 1;
    let autoAccumulator = 0;
    let lastTime = performance.now();
    const startTime = lastTime;
    // Frames run at a lively pace right away, then ease into a calm, steady
    // living drift — fast at first, smooth and natural as you scroll.
    const RAMP_START_MS = 28;    // lively but calm opening pace (~36fps)
    const RAMP_MIN_MS = 34;      // steady smooth drift (~30fps)
    const RAMP_DURATION = 5000;  // settle into the steady pace
    const SLOW_OPENING = 0;      // no slow hold at the opening

    // Eagerly decode so the decode cost is paid once, not at draw time.
    images.forEach((img) => { if (img.complete) img.decode?.().catch(() => {}); });

    let cw = 0;
    let ch = 0;
    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = Math.floor(window.innerWidth * dpr);
      ch = Math.floor(window.innerHeight * dpr);
      // Only reassign dimensions when they actually change (avoids per-frame clears).
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
    };

    const drawCover = (img: HTMLImageElement | undefined) => {
      if (!img || !img.complete || !img.naturalWidth) return;
      ctx.imageSmoothingEnabled = true;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const sx = (cw - dw) / 2;
      const sy = (ch - dh) / 2;
      ctx.drawImage(img, sx, sy, dw, dh);
    };

      const render = () => {
        // If no frames ever loaded, stop the loop (avoids a pointless 50fps spin).
        if (!images.length || !images[0]?.complete) {
          raf = requestAnimationFrame(render);
          return;
        }
        const now = performance.now();
        const dt = now - lastTime;
        lastTime = now;

      // Smoothly ramp playback speed: slow at the opening, faster over time.
      const elapsed = now - startTime;
      let stepMs = RAMP_START_MS;
      if (currentIndex < SLOW_OPENING) {
        // Hold the very first frames extra-long for a gentle, slow open.
        stepMs = RAMP_START_MS * 1.8;
      } else {
        const t = Math.min(1, elapsed / RAMP_DURATION);
        // Ease-out curve so acceleration feels natural.
        const eased = 1 - Math.pow(1 - t, 2);
        stepMs = RAMP_START_MS - (RAMP_START_MS - RAMP_MIN_MS) * eased;
      }

      // ~50fps smooth ping-pong auto-play (bounces at both ends)
      autoAccumulator += dt;
      let stepped = false;
      while (autoAccumulator >= stepMs) {
        autoAccumulator -= stepMs;
        let next = currentIndex + autoDir;
        if (next >= count - 1) { next = count - 1; autoDir = -1; }
        else if (next <= 0) { next = 0; autoDir = 1; }
        currentIndex = next;
        stepped = true;
      }
      // Cap catch-up so a long pause doesn't fast-forward the whole loop.
      if (autoAccumulator > stepMs * 4) autoAccumulator = 0;

      if (stepped && currentIndex !== displayedIndex) {
        displayedIndex = currentIndex;
        drawCover(images[currentIndex]);
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    // Draw the first frame as soon as it is ready (handles decode race at mount)
    const drawFirst = () => { currentIndex = 0; displayedIndex = -1; };
    if (images[0]?.complete) drawFirst();
    else images[0].onload = drawFirst;
    const t1 = window.setTimeout(drawFirst, 60);
    const t2 = window.setTimeout(drawFirst, 300);

    const handleResize = () => {
      sizeCanvas();
      drawCover(images[displayedIndex >= 0 ? displayedIndex : 0]);
    };

    window.addEventListener('resize', handleResize);
    sizeCanvas();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [images]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0c0c0c]">
      <canvas ref={canvasRef} className="w-full h-full block" style={{ transform: 'translateZ(0)' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
    </div>
  );
}
