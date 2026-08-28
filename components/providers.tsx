"use client";

import { ReactNode } from "react";
import { ToastProvider } from "@/lib/toast";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </ToastProvider>
  );
}
