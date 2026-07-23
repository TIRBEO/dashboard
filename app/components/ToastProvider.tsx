"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";

type ToastItem = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

type ToastContextType = {
  toast: (message: string, type?: "success" | "error" | "info", duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const toast = useCallback((message: string, type: "success" | "error" | "info" = "success", duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    const timer = setTimeout(() => removeToast(id), duration);
    timers.current.set(id, timer);
  }, [removeToast]);

  const ctx = {
    toast,
    success: (msg: string) => toast(msg, "success"),
    error: (msg: string) => toast(msg, "error", 4000),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {toasts.length > 0 && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          display: "flex", flexDirection: "column", gap: 8, maxWidth: 380,
          pointerEvents: "none",
        }}>
          {toasts.map(t => (
            <div
              key={t.id}
              style={{
                pointerEvents: "auto",
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", borderRadius: 12,
                background: "rgba(18,18,20,0.92)",
                backdropFilter: "blur(24px) saturate(1.4)",
                border: `1px solid ${t.type === "error" ? "rgba(255,97,97,0.3)" : t.type === "info" ? "rgba(79,122,255,0.3)" : "rgba(89,212,153,0.3)"}`,
                boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6)",
                animation: "toastIn 0.25s cubic-bezier(0.16,1,0.3,1)",
                fontSize: 13, fontWeight: 500,
                color: "var(--text)",
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                background: t.type === "error" ? "var(--danger)" : t.type === "info" ? "#4f7aff" : "var(--success)",
              }} />
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: "none", border: "none", color: "var(--text-muted)",
                  cursor: "pointer", padding: 2, fontSize: 14, lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (msg: string, type?: string, duration?: number) => {
        console.log(`[TOAST ${type || "success"}] ${msg}`);
      },
      success: (msg: string) => console.log(`[TOAST success] ${msg}`),
      error: (msg: string) => console.error(`[TOAST error] ${msg}`),
    };
  }
  return ctx;
}
