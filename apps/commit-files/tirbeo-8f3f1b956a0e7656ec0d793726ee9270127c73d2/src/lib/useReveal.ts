import { useEffect, useRef } from 'react';

// Lightweight reveal-on-scroll using IntersectionObserver (no GSAP).
// Any element with the `.reveal` class inside the returned ref fades/slides in.
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('.reveal'));
    if (!items.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    items.forEach((item) => io.observe(item));
    return () => io.disconnect();
  }, []);

  return ref;
}
