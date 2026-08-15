"use client";
import { useEffect } from "react";

let dirty = false;
const listeners: Array<(d: boolean) => void> = [];

export function isDirtyGlobal() { return dirty; }

export function setDirtyGlobal(d: boolean) {
  dirty = d;
  listeners.forEach(fn => fn(d));
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-dirty', String(d));
  }
}

export function onDirtyChange(fn: (d: boolean) => void) {
  listeners.push(fn);
  return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
}

export function useUnsavedGuard() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dirty) return;
      const target = e.target as HTMLElement | null;
      const link = target?.closest('a[href], .sidebar-item, .menu-item') as HTMLElement | null;
      if (!link) return;
      e.preventDefault();
      e.stopPropagation();
      if (navigator.vibrate) { try { navigator.vibrate(200); } catch {} }
      // Show save prompt
      const banner = document.querySelector('.tb-unsaved-banner');
      if (banner) return;
      const el = document.createElement('div');
      el.className = 'tb-unsaved-banner';
      el.innerHTML = '<span>You have unsaved changes — save before leaving this page.</span>';
      el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;padding:12px 18px;border-radius:12px;background:var(--tb-surface-1);border:1px solid var(--tb-red);color:var(--tb-text-primary);font-size:13.5px;font-weight:500;box-shadow:0 0 0 4px rgba(239,68,68,0.18),0 12px 40px rgba(0,0,0,0.45);animation:fadeIn 200ms';
      document.body.appendChild(el);
      // Highlight save button
      const saveBtn = document.querySelector('.btn-primary') as HTMLElement | null;
      if (saveBtn) {
        saveBtn.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.4)';
        saveBtn.style.animation = 'badge-pulse 600ms';
        setTimeout(() => { saveBtn.style.boxShadow = ''; saveBtn.style.animation = ''; }, 3000);
      }
      setTimeout(() => el.remove(), 4000);
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);
}
