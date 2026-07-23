"use client";

import { FlaskConical, Beaker, Sparkles } from "lucide-react";
import { useState } from "react";

const LABS = [
  { id: "ai-search", name: "AI-Powered Search", desc: "Semantic search across your workspace using natural language", enabled: false },
  { id: "realtime-collab", name: "Real-time Collaboration", desc: "Edit documents simultaneously with team members", enabled: false },
  { id: "auto-tags", name: "Auto-Tagging", desc: "AI automatically categorizes your files and messages", enabled: false },
  { id: "smart-notif", name: "Smart Notifications", desc: "AI-prioritized notifications based on importance", enabled: false },
];

export default function LabsPage() {
  const [features, setFeatures] = useState(LABS);
  const toggle = (id: string) => setFeatures((f) => f.map((x) => x.id === id ? { ...x, enabled: !x.enabled } : x));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Labs</h1>
        <p className="text-sm text-muted-foreground">Experimental features still in development</p>
        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium bg-[#d8b36a]/15 text-[#d8b36a]">Beta</span>
      </div>

      <div className="glass card-section">
        <p className="text-xs text-muted-foreground mb-4">These features may be unstable, change, or be removed at any time. Enable at your own risk.</p>
        <div className="space-y-3">
          {features.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-3">
                <FlaskConical size={14} className={f.enabled ? "text-[#59d499]" : "text-[#7b7e84]"} />
                <div>
                  <p className="text-sm font-medium text-white">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
              <button onClick={() => toggle(f.id)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${f.enabled ? "bg-[#d8b36a]" : "bg-white/10"}`}>
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${f.enabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
