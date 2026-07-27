import { useRef, useEffect, useState } from 'react';

type AnimatedTextProps = {
  text: string;
  className?: string;
  /** 0..1 fraction by which to push this paragraph's reveal window later,
   *  so multiple paragraphs read top-to-bottom instead of all at once. */
  delay?: number;
};

// Word-by-word scroll reveal. Each word fades + rises in based on its position
// in the text relative to overall scroll progress. `delay` shifts the whole
// window later so stacked paragraphs reveal in order. Word-level (not char-level)
// keeps natural line wrapping and stays smooth on long paragraphs.
//
// NO hooks inside loops — computes per-word styles from a single scroll progress
// value stored in state, which is updated by a passive scroll listener.
export const AnimatedText = ({ text, className, delay = 0 }: AnimatedTextProps) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when element top is at 95% viewport, 1 when at 55% viewport
        const raw = 1 - (rect.top - vh * 0.55) / (vh * 0.40);
        const clamped = Math.min(1, Math.max(0, raw));
        let v = clamped;
        if (delay > 0) {
          v = Math.min(1, Math.max(0, (clamped - delay * 0.25) / (1 - delay * 0.25)));
        }
        setProgress(v);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial check
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [delay]);

  const words = text.split(' ');
  const min = 0.25;

  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        const t = progress <= start ? 0 : progress >= end ? 1 : (progress - start) / (end - start);
        const opacity = min + (1 - min) * t;
        const y = 10 * (1 - t);
        return (
          <span
            key={`${text.length}-${i}`}
            style={{ opacity, transform: `translateY(${y}px)`, display: 'inline-block', whiteSpace: 'pre' }}
            aria-hidden="true"
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        );
      })}
    </p>
  );
};

export default AnimatedText;
