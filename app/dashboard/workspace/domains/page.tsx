"use client";

import { Globe, Plus, ExternalLink } from "lucide-react";

export default function DomainsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Custom Domains</h1>
        <p className="text-sm text-muted-foreground">Connect custom domains to your workspace</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Domains</h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#d8b36a]/15 text-[#d8b36a]">Coming Soon</span>
        </div>
        <div className="text-center py-12">
          <Globe size={48} className="mx-auto mb-3" style={{ color: "#7b7e84" }} />
          <p className="text-sm text-muted-foreground mb-1">Custom domains coming soon</p>
          <p className="text-xs text-muted-foreground">Connect your own domain to access Tirbeo with your brand</p>
        </div>
      </div>
    </div>
  );
}
