"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--tb-bg,#0a0a0a)] text-[var(--tb-text-primary,#fff)] font-[system-ui,-apple-system,sans-serif]">
      <div className="max-w-[440px] w-full text-center p-10 bg-[var(--tb-surface-1,#111)] border border-[var(--tb-border,#222)] rounded-2xl">
        <div className="text-[64px] font-extrabold text-[var(--tb-text-disabled,#333)] leading-none mb-4">
          404
        </div>
        <h1 className="text-xl font-bold mb-2 tracking-[-0.02em]">
          Page not found
        </h1>
        <p className="text-sm text-[var(--tb-text-muted,#666)] leading-relaxed mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/overview"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[var(--tb-text-primary,#fff)] text-[var(--tb-bg,#000)] text-sm font-semibold no-underline"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
