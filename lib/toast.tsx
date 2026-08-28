"use client";
import { toast as sonnerToast } from "sonner";
import { createContext, useContext, ReactNode } from "react";

// 21st dev: shadcn sonner — now the single source for toasts
// Keeps old useToast() API for backwards compat, but delegates to sonner

type ToastType = "success" | "error" | "info";

const ToastContext = createContext<{ toast: (msg: string, type?: ToastType) => void; error: (msg: string) => void; success: (msg: string) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  // sonner Toaster is rendered globally in layout, this provider is now a thin compat layer
  const api = {
    toast: (m: string, type: ToastType = "info") => {
      if (type === "success") sonnerToast.success(m);
      else if (type === "error") sonnerToast.error(m);
      else sonnerToast(m);
    },
    error: (m: string) => sonnerToast.error(m),
    success: (m: string) => sonnerToast.success(m),
  };
  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function showToastGlobal(message: string, type: ToastType = "error") {
  if (type === "success") sonnerToast.success(message);
  else if (type === "error") sonnerToast.error(message);
  else sonnerToast(message);
}
