"use client";

import { Hash, ExternalLink } from "lucide-react";

export default function SlackIntegrationPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Slack Integration</h1>
        <p className="text-sm text-muted-foreground">Connect Slack for team notifications and alerts</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#4A154B]/20 flex items-center justify-center">
            <Hash size={24} className="text-[#E01E5A]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Slack</p>
            <p className="text-xs text-muted-foreground">Not connected</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Post workspace activity and alerts directly to your Slack channels.</p>
        <button className="btn btn-primary text-xs flex items-center gap-2">
          <Hash size={13} /> Add to Slack
        </button>
      </div>

      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-3">Features</h3>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-[#59d499] mt-0.5">+</span> Post notifications to specific channels</li>
          <li className="flex items-start gap-2"><span className="text-[#59d499] mt-0.5">+</span> Receive DM alerts for mentions</li>
          <li className="flex items-start gap-2"><span className="text-[#59d499] mt-0.5">+</span> Slash commands for quick actions</li>
        </ul>
      </div>
    </div>
  );
}
