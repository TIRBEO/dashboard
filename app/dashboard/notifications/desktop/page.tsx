"use client";

import { useState } from "react";
import { Monitor } from "lucide-react";

export default function DesktopNotificationsPage() {
  const [settings, setSettings] = useState({
    desktopEnabled: true,
    soundEnabled: true,
    badgeEnabled: true,
    mentions: true,
    directMessages: true,
    taskUpdates: false,
  });

  const toggle = (key: string) => setSettings((s) => ({ ...s, [key]: !s[key as keyof typeof s] }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Desktop Notifications</h1>
        <p className="text-sm text-muted-foreground">Native OS notification settings for desktop browsers</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-4">
          <Monitor size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Desktop Settings</h3>
        </div>
        {[
          { key: "desktopEnabled", label: "Desktop Notifications", desc: "Show native OS notifications" },
          { key: "soundEnabled", label: "Notification Sound", desc: "Play a sound when notifications arrive" },
          { key: "badgeEnabled", label: "Taskbar Badge", desc: "Show unread count on app icon" },
          { key: "mentions", label: "Mentions", desc: "Desktop notification for mentions" },
          { key: "directMessages", label: "Direct Messages", desc: "Desktop notification for DMs" },
          { key: "taskUpdates", label: "Task Updates", desc: "Desktop notification for task changes" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
            <div>
              <p className="text-sm text-white">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <button onClick={() => toggle(item.key)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? "bg-[#d8b36a]" : "bg-white/10"}`}>
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${settings[item.key as keyof typeof settings] ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary px-6 py-2 text-sm">Save Desktop Settings</button>
      </div>
    </div>
  );
}
