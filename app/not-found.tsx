"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--tb-bg, #0a0a0a)",
        color: "var(--tb-text-primary, #fff)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
          padding: 40,
          background: "var(--tb-surface-1, #111)",
          border: "1px solid var(--tb-border, #222)",
          borderRadius: 16,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "var(--tb-text-disabled, #333)",
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--tb-text-muted, #666)",
            lineHeight: 1.5,
            marginBottom: 24,
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/overview"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            borderRadius: 8,
            background: "var(--tb-text-primary, #fff)",
            color: "var(--tb-bg, #000)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
