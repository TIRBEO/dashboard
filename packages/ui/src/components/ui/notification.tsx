"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "../../lib/utils";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  onDismiss: (id: string) => void;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: "border-l-tirbeo-green-500 bg-tirbeo-green-50",
  error: "border-l-tirbeo-red-500 bg-tirbeo-red-50",
  warning: "border-l-tirbeo-yellow-500 bg-tirbeo-yellow-50",
  info: "border-l-tirbeo-blue-500 bg-tirbeo-blue-50",
};

const iconColors = {
  success: "text-tirbeo-green-600",
  error: "text-tirbeo-red-600",
  warning: "text-tirbeo-yellow-600",
  info: "text-tirbeo-blue-600",
};

export function Toast({ id, type, title, message, action, onDismiss, duration = 5000 }: ToastProps) {
  const Icon = icons[type];

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-tirbeo-neutral-300 border-l-4 p-4 shadow-dropdown w-full max-w-sm animate-in slide-in-from-right",
        colors[type],
      )}
    >
      <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", iconColors[type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-tirbeo-neutral-900">{title}</p>
        {message && <p className="text-xs text-tirbeo-neutral-700 mt-0.5">{message}</p>}
        {action && (
          <button onClick={action.onClick} className="text-xs font-medium text-tirbeo-blue-600 hover:underline mt-1">
            {action.label}
          </button>
        )}
      </div>
      <button onClick={() => onDismiss(id)} className="p-0.5 text-tirbeo-neutral-500 hover:text-tirbeo-neutral-900 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export interface ToastManager {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, "id" | "onDismiss">) => string;
  dismissToast: (id: string) => void;
}

let toastCounter = 0;

export function useToastManager(): ToastManager {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastProps, "id" | "onDismiss">) => {
    const id = `toast-${++toastCounter}`;
    setToasts(prev => [...prev, { ...toast, id, onDismiss: dismissToast }]);
    return id;
  }, [dismissToast]);

  return { toasts, addToast, dismissToast };
}

export function ToastContainer({ toasts, dismissToast }: { toasts: ToastProps[]; dismissToast: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

export { ToastContainer as Toaster };
