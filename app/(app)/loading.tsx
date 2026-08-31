"use client";

export default function AppLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-tb-bg text-tb-text-muted">
      <div className="flex flex-col items-center gap-4">
        <div className="w-7 h-7 border-[3px] border-tb-border border-t-tb-accent rounded-full animate-spin" />
        <span className="text-[13px] font-medium">Loading dashboard...</span>
      </div>
    </div>
  );
}
