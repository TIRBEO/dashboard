"use client";

export default function AppLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--tb-bg)",
        color: "var(--tb-text-muted)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            border: "3px solid var(--tb-border)",
            borderTopColor: "var(--tb-accent, var(--tb-text-primary))",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Loading dashboard...</span>
      </div>
    </div>
  );
}
