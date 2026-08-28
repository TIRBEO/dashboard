"use client";
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--tb-bg, #0a0a0a)", color: "var(--tb-text-primary, #fff)", flexDirection: "column", gap: 12 }}>
      <h1 style={{ fontSize: 20 }}>Dashboard error</h1><p style={{ color: "var(--tb-text-muted, #999)", maxWidth: 400, textAlign: "center" }}>{error.message}</p>
      <button onClick={() => reset()} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--tb-border, #333)", background: "var(--tb-text-primary, #fff)", color: "var(--tb-bg, #000)", cursor: "pointer" }}>Try again</button>
    </div>
  );
}
