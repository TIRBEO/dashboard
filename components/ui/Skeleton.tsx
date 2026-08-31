"use client";

import { type CSSProperties } from "react";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  style?: CSSProperties;
  className?: string;
}

export function Skeleton({ width, height = 16, borderRadius = 6, style, className }: SkeletonProps) {
  return (
    <div
      className={`tb-skeleton ${className || ""}`}
      style={{ width, height, borderRadius, flexShrink: 0, ...style }}
    />
  );
}

export function SkeletonText({ lines = 3, gap = 8 }: { lines?: number; gap?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={`${70 + Math.random() * 30}%`} height={12} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="dashboard-card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Skeleton width={40} height={40} borderRadius={10} />
        <div style={{ flex: 1 }}>
          <Skeleton width="40%" height={14} style={{ marginBottom: 6 }} />
          <Skeleton width="25%" height={10} />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="page-stack">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Skeleton width={200} height={24} style={{ marginBottom: 8 }} />
        <Skeleton width={320} height={14} />
      </div>
      {/* Cards */}
      <div className="dashboard-card">
        <Skeleton width={160} height={18} style={{ marginBottom: 4 }} />
        <Skeleton width={280} height={12} style={{ marginBottom: 20 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < 3 ? "1px solid tb-border" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Skeleton width={15} height={15} borderRadius={4} />
              <div>
                <Skeleton width={120} height={13} style={{ marginBottom: 4 }} />
                <Skeleton width={200} height={10} />
              </div>
            </div>
            <Skeleton width={36} height={20} borderRadius={10} />
          </div>
        ))}
      </div>
      <div className="dashboard-card">
        <Skeleton width={160} height={18} style={{ marginBottom: 16 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < 2 ? "1px solid tb-border" : "none" }}>
            <div>
              <Skeleton width={100} height={13} style={{ marginBottom: 4 }} />
              <Skeleton width={180} height={10} />
            </div>
            <Skeleton width={36} height={20} borderRadius={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 4, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 16, padding: "10px 16px", borderBottom: "1px solid tb-border", background: "var(--tb-surface-1)" }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={i === 0 ? 60 : `${60 + Math.random() * 80}px`} height={10} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: "flex", gap: 16, padding: "12px 16px", borderBottom: r < rows - 1 ? "1px solid tb-border" : "none", alignItems: "center" }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} width={c === 0 ? 60 : `${40 + Math.random() * 100}px`} height={c === 0 ? 10 : 13} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonNotifList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: r < rows - 1 ? "1px solid tb-border" : "none" }}>
          <Skeleton width={6} height={6} borderRadius="50%" />
          <Skeleton width={32} height={32} borderRadius={8} />
          <div style={{ flex: 1 }}>
            <Skeleton width={`${50 + Math.random() * 40}%`} height={13} style={{ marginBottom: 4 }} />
            <Skeleton width={`${30 + Math.random() * 30}%`} height={10} />
          </div>
          <Skeleton width={50} height={10} />
        </div>
      ))}
    </div>
  );
}
