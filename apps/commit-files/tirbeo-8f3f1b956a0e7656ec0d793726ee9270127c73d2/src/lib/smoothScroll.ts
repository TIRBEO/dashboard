// Lightweight inertial smooth scrolling — no GSAP / no external deps.
//
// Native scrolling stays the source of truth (so position: sticky, the canvas
// scroll handler, and anchor jumps all keep working). We only intercept the
// mouse wheel: each tick adds to a virtual target, and we ease the real scroll
// position toward that target with a lerp. One wheel tick therefore glides
// slowly and smoothly instead of jumping.

let enabled = false;
let rafId = 0;
let target = 0;
let current = 0;
let ease = 0.045; // lower = slower / smoother glide
const accum = 60; // px added per wheel "notch" (smaller = slower scroll)

export function initSmoothScroll() {
  if (enabled || typeof window === 'undefined') return;
  const fine = window.matchMedia('(pointer: fine)').matches;
  if (!fine) return; // keep touch native
  enabled = true;

  target = window.scrollY;
  current = window.scrollY;
  // When an external scroll source (scrollbar drag, keyboard, touch) moves the
  // page, we adopt its position instead of fighting it. We detect this by
  // comparing against our last *intended* position, not against `current`.
  let external = false;

  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey) return; // let the browser zoom
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    target = Math.max(0, Math.min(target + delta * (accum / 100), max));
    external = false;
    if (!rafId) rafId = requestAnimationFrame(render);
  };

  const render = () => {
    current += (target - current) * ease;
    if (Math.abs(target - current) < 0.4) current = target;
    const rounded = Math.round(current);
    if (rounded !== window.scrollY) window.scrollTo(0, rounded);
    if (current !== target) {
      rafId = requestAnimationFrame(render);
    } else {
      rafId = 0;
    }
  };

  // Adopt external scroll movement (scrollbar / keyboard / touch) so the
  // smooth layer never fights the browser and causes jitter.
  window.addEventListener('scroll', () => {
    if (external) {
      target = window.scrollY;
      current = window.scrollY;
    }
    // After our own scrollTo, briefly mark as external to ignore the echo.
    external = true;
    setTimeout(() => { external = false; }, 0);
  }, { passive: true });

  window.addEventListener('wheel', onWheel, { passive: false });
}

export function destroySmoothScroll() {
  if (!enabled) return;
  enabled = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
}

// Smooth anchor jump.
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
  target = top;
  current = window.scrollY;
  if (!rafId) rafId = requestAnimationFrame(function step() {
    current += (target - current) * ease;
    if (Math.abs(target - current) < 0.4) current = target;
    window.scrollTo(0, Math.round(current));
    if (current !== target) rafId = requestAnimationFrame(step);
    else rafId = 0;
  });
}
