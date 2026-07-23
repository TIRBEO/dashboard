"use client";

import { useState } from "react";
import { Bell, Smartphone } from "lucide-react";

export default function PushNotificationsPage() {
  const [settings, setSettings] = useState({
    pushEnabled: true,
    mentions: true,
    directMessages: true,
    workspaceUpdates: true,
    systemAlerts: true,
    marketingPush: false,
  });

  const toggle = (key: string) => setSettings((s) => ({ ...s, [key]: !s[key as keyof typeof s] }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Push Notifications</h1>
        <p className="text-sm text-muted-foreground">Configure browser and mobile push notifications</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Push Settings</h3>
        </div>
        {[
          { key: "pushEnabled", label: "Enable Push Notifications", desc: "Receive push notifications in browser and mobile" },
          { key: "mentions", label: "Mentions", desc: "When someone mentions you in a conversation" },
          { key: "directMessages", label: "Direct Messages", desc: "New direct message notifications" },
          { key: "workspaceUpdates", label: "Workspace Updates", desc: "Changes and updates in your workspaces" },
          { key: "systemAlerts", label: "System Alerts", desc: "Important system announcements" },
          { key: "marketingPush", label: "Marketing", desc: "Product updates and feature announcements" },
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

      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Registered Devices</h3>
        </div>
        <p className="text-xs text-muted-foreground">No push-enabled devices registered. Enable push in your browser or install the mobile app.</p>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary px-6 py-2 text-sm">Save Push Settings</button>
      </div>
    </div>
  );
}
