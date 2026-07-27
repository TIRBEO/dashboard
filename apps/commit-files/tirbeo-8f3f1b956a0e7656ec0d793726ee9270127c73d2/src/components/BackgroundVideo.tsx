import { useEffect, useRef } from 'react';

export function BackgroundVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let destroyed = false;
    let hlsInstance: { destroy: () => void } | null = null;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari) — no library needed
      video.src = src;
    } else {
      // Lazy-load hls.js only when required (keeps initial bundle small & fast)
      import('hls.js')
        .then(({ default: Hls }) => {
          if (destroyed) return;
          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, maxBufferLength: 10, capLevelToPlayerSize: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            hlsInstance = hls;
          } else {
            video.src = src;
          }
        })
        .catch(() => {
          video.src = src;
        });
    }

    return () => {
      destroyed = true;
      hlsInstance?.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover opacity-100"
      />
      {/* Readability overlay: stronger at the top/hero, lighter toward the middle */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/65" />
      <div className="absolute inset-0 bg-[#0c0c0c]/20" />
    </div>
  );
}

