"use client";
export function vibrate(pattern: number | number[] = 30) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
}
export const haptic = {
  light: () => vibrate(15),
  medium: () => vibrate(30),
  heavy: () => vibrate([30, 20, 30]),
  success: () => vibrate([15, 25, 15]),
  error: () => vibrate([40, 30, 40]),
  warning: () => vibrate([20, 15, 20]),
};
