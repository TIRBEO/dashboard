"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";

export default function DigestPage() {
  const [settings, setSettings] = useState({
    digestEnabled: true,
    frequency: "daily",
    time: "09:00",
    includeMentions: true,
    includeMessages: true,
    includeActivity: true,
    includeWorkspace: false,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Digest</h1>
        <p className="text-sm text-muted-foreground">Get a summary of activity sent to your email</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Digest Settings</h3>
        </div>

        <div className="flex items-center justify-between py-2.5 border-b border-white/5">
          <div>
            <p className="text-sm text-white">Enable Digest Emails</p>
            <p className="text-xs text-muted-foreground">Receive a summary of activity</p>
          </div>
          <button onClick={() => setSettings((s) => ({ ...s, digestEnabled: !s.digestEnabled }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.digestEnabled ? "bg-[#d8b36a]" : "bg-white/10"}`}>
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${settings.digestEnabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-white font-medium mb-2">Frequency</p>
          <div className="flex gap-2">
            {["daily", "weekly", "biweekly"].map((freq) => (
              <button key={freq} onClick={() => setSettings((s) => ({ ...s, frequency: freq }))}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${settings.frequency === freq ? "bg-[#d8b36a] text-black font-medium" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-white font-medium mb-2">Preferred Time</p>
          <input type="time" value={settings.time} onChange={(e) => setSettings((s) => ({ ...s, time: e.target.value }))}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm text-white font-medium mb-2">Include in Digest</p>
          {[
            { key: "includeMentions", label: "Mentions & Tags" },
            { key: "includeMessages", label: "Direct Messages" },
            { key: "includeActivity", label: "General Activity" },
            { key: "includeWorkspace", label: "Workspace Updates" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-1.5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <button onClick={() => setSettings((s) => ({ ...s, [item.key]: !s[item.key as keyof typeof s] }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? "bg-[#d8b36a]" : "bg-white/10"}`}>
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${settings[item.key as keyof typeof settings] ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary px-6 py-2 text-sm">Save Digest Settings</button>
      </div>
    </div>
  );
}
