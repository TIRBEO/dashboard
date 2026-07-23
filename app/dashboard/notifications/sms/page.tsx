"use client";

import { Smartphone } from "lucide-react";

export default function SmsNotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">SMS Notifications</h1>
        <p className="text-sm text-muted-foreground">Configure text message notifications</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">SMS Settings</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <Smartphone size={28} className="text-[#d8b36a]" />
          </div>
          <p className="text-sm text-white font-medium mb-1">SMS Notifications</p>
          <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">SMS notifications are coming soon. You will be able to receive important alerts via text message.</p>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#d8b36a]/15 text-[#d8b36a]">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
