"use client";

import { Sparkles, Eye } from "lucide-react";
import { useState } from "react";

const PREVIEWS = [
  { id: "cmd-palette", name: "Command Palette 2.0", desc: "Redesigned command palette with fuzzy search and recent actions", enabled: false },
  { id: "dark-blue", name: "Midnight Blue Theme", desc: "New dark theme variant with deep blue accents", enabled: false },
  { id: "inline-editor", name: "Inline Profile Editor", desc: "Edit your profile directly from the dashboard", enabled: false },
];

export default function FeaturePreviewPage() {
  const [previews, setPreviews] = useState(PREVIEWS);
  const toggle = (id: string) => setPreviews((p) => p.map((x) => x.id === id ? { ...x, enabled: !x.enabled } : x));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Feature Preview</h1>
        <p className="text-sm text-muted-foreground">Preview upcoming features before they launch</p>
        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium bg-[#d8b36a]/15 text-[#d8b36a]">Beta</span>
      </div>

      <div className="glass card-section space-y-3">
        {previews.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-3">
              <Eye size={14} className={p.enabled ? "text-[#59d499]" : "text-[#7b7e84]"} />
              <div>
                <p className="text-sm font-medium text-white">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            </div>
            <button onClick={() => toggle(p.id)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.enabled ? "bg-[#d8b36a]" : "bg-white/10"}`}>
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${p.enabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
