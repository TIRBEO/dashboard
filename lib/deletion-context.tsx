"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getCurrentUser } from "@/lib/api";

interface DeletionCtx { deleting: boolean; scheduledAt: string | null; refresh: () => void }
const Ctx = createContext<DeletionCtx>({ deleting: false, scheduledAt: null, refresh: () => {} });

export function DeletionProvider({ children }: { children: ReactNode }) {
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const refresh = () => {
    getCurrentUser().then((u: any) => setScheduledAt(u?.scheduledDeletionAt ?? null)).catch(() => {});
  };
  useEffect(() => { refresh(); }, []);
  // Listen for cancellation from AppShell
  useEffect(() => {
    const h = () => setScheduledAt(null);
    window.addEventListener("tb:deletion-cancelled", h);
    return () => window.removeEventListener("tb:deletion-cancelled", h);
  }, []);
  return <Ctx.Provider value={{ deleting: !!scheduledAt, scheduledAt, refresh }}>{children}</Ctx.Provider>;
}
export function useScheduledDeletion() { return useContext(Ctx); }
