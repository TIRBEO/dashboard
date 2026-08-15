"use client";
import { AppShell } from "@/components/AppShell";
import { useUnsavedGuard } from "@/lib/unsaved";
import { LanguageProvider } from "@/lib/i18n";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useUnsavedGuard();
  return (
    <LanguageProvider>
      <AppShell>{children}</AppShell>
    </LanguageProvider>
  );
}
