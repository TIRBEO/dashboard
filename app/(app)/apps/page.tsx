"use client";
import { LayoutGrid } from "lucide-react";

export default function AppsPage() {
  return (
    <div className="max-w-[640px] mx-auto py-8 px-4">
      <h1 className="page-title">Apps</h1>
      <p className="page-subtitle">Manage your connected apps</p>

      <div className="mt-6">
        <div className="card p-8 text-center">
          <LayoutGrid size={32} className="mx-auto mb-3" style={{ color: "var(--tb-on-surface-variant)" }} />
          <p className="text-[14px] font-medium" style={{ color: "var(--tb-on-surface)" }}>No apps connected</p>
          <p className="text-[13px] mt-1" style={{ color: "var(--tb-on-surface-variant)" }}>Apps will appear here once connected</p>
        </div>
      </div>
    </div>
  );
}
