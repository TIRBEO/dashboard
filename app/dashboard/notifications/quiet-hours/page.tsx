"use client";

import { useState } from "react";
import { Moon } from "lucide-react";

export default function QuietHoursPage() {
  const [settings, setSettings] = useState({
    enabled: true,
    start: "22:00",
    end: "08:00",
    timezone: "Asia/Kathmandu",
    allowUrgent: true,
    weekendMode: false,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Quiet Hours</h1>
        <p className="text-sm text-muted-foreground">Pause notifications during focus or sleep time</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-4">
          <Moon size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Quiet Hours</h3>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <div>
            <p className="text-sm text-white">Enable Quiet Hours</p>
            <p className="text-xs text-muted-foreground">Silence all notifications during set hours</p>
          </div>
          <button onClick={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.enabled ? "bg-[#d8b36a]" : "bg-white/10"}`}>
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${settings.enabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-white font-medium mb-1">Start Time</p>
            <input type="time" value={settings.start} onChange={(e) => setSettings((s) => ({ ...s, start: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <p className="text-sm text-white font-medium mb-1">End Time</p>
            <input type="time" value={settings.end} onChange={(e) => setSettings((s) => ({ ...s, end: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-white font-medium mb-1">Timezone</p>
          <select value={settings.timezone} onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
            <option value="Asia/Kathmandu">Nepal (UTC+5:45)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern (UTC-5)</option>
            <option value="America/Los_Angeles">Pacific (UTC-8)</option>
            <option value="Europe/London">London (UTC+0)</option>
            <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
          </select>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between py-1.5">
            <div>
              <p className="text-sm text-white">Allow Urgent Messages</p>
              <p className="text-xs text-muted-foreground">Override quiet hours for marked urgent</p>
            </div>
            <button onClick={() => setSettings((s) => ({ ...s, allowUrgent: !s.allowUrgent }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.allowUrgent ? "bg-[#d8b36a]" : "bg-white/10"}`}>
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${settings.allowUrgent ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <div>
              <p className="text-sm text-white">Weekend Mode</p>
              <p className="text-xs text-muted-foreground">Extended quiet hours on weekends</p>
            </div>
            <button onClick={() => setSettings((s) => ({ ...s, weekendMode: !s.weekendMode }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.weekendMode ? "bg-[#d8b36a]" : "bg-white/10"}`}>
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${settings.weekendMode ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary px-6 py-2 text-sm">Save Quiet Hours</button>
      </div>
    </div>
  );
}
