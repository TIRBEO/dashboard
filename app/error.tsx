"use client";
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--tb-bg,#0a0a0a)] text-[var(--tb-text-primary,#fff)] flex-col gap-3">
      <h1 className="text-xl">Dashboard error</h1>
      <p className="text-[var(--tb-text-muted,#999)] max-w-[400px] text-center">{error.message}</p>
      <button onClick={() => reset()} className="px-4 py-2 rounded-lg border border-[var(--tb-border,#333)] bg-[var(--tb-text-primary,#fff)] text-[var(--tb-bg,#000)] cursor-pointer">Try again</button>
    </div>
  );
}
