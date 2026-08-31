"use client";
import { useEffect } from "react";
import { haptic } from "@/lib/haptics";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { haptic.error(); }, []);
  return (
    <div className="rounded-xl border border-tb-border bg-tb-surface-1 p-8 text-center max-w-md mx-auto mt-12">
      <h2 className="text-lg font-bold text-tb-text-primary mb-2">Something went wrong</h2>
      <p className="text-[14px] text-tb-text-muted mb-4">{error.message || "An unexpected error occurred."}</p>
      <div className="flex gap-2 justify-center">
        <Button size="sm" onClick={() => reset()}>Try again</Button>
        <Button variant="ghost" size="sm" onClick={() => window.location.href = "/overview"}>Go to overview</Button>
      </div>
    </div>
  );
}
