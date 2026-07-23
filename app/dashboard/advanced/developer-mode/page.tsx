"use client";

import { useState } from "react";
import { Code, Copy } from "lucide-react";

export default function DeveloperModePage() {
  const [enabled, setEnabled] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Developer Mode</h1>
        <p className="text-sm text-muted-foreground">Debug tools and raw data inspection</p>
      </div>

      <div className="glass card-section space-y-4">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-white font-medium">Enable Developer Mode</p>
            <p className="text-xs text-muted-foreground">Shows debug info, raw JSON, and API details</p>
          </div>
          <button onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? "bg-[#d8b36a]" : "bg-white/10"}`}>
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${enabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
          </button>
        </div>

        {enabled && (
          <>
            <div className="flex items-center justify-between py-2 border-t border-white/5">
              <div>
                <p className="text-sm text-white">Show Raw Data</p>
                <p className="text-xs text-muted-foreground">Display raw JSON on settings pages</p>
              </div>
              <button onClick={() => setShowRaw(!showRaw)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showRaw ? "bg-[#d8b36a]" : "bg-white/10"}`}>
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${showRaw ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-black/40 font-mono text-xs text-[#59d499]">
              <div className="flex items-center gap-2 mb-2">
                <Code size={12} className="text-[#d8b36a]" />
                <span className="text-white font-semibold">Session Info</span>
              </div>
              <pre className="text-muted-foreground overflow-x-auto">
{JSON.stringify({
  userId: "usr_...",
  sessionId: "ses_...",
  expiresAt: "2026-08-23T00:00:00Z",
  role: null,
  features: { devMode: true },
}, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
