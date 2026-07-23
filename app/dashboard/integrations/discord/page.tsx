"use client";

import { MessageCircle, ExternalLink } from "lucide-react";

export default function DiscordIntegrationPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Discord Integration</h1>
        <p className="text-sm text-muted-foreground">Connect your Discord account for notifications and authentication</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#5865F2]/20 flex items-center justify-center">
            <MessageCircle size={24} className="text-[#5865F2]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Discord</p>
            <p className="text-xs text-muted-foreground">Not connected</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Connect Discord to receive workspace notifications in your Discord channels and use Discord as a sign-in method.</p>
        <button className="btn btn-primary text-xs flex items-center gap-2">
          <MessageCircle size={13} /> Connect Discord
        </button>
      </div>

      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-3">What you can do</h3>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-[#59d499] mt-0.5">+</span> Receive workspace notifications via webhook</li>
          <li className="flex items-start gap-2"><span className="text-[#59d499] mt-0.5">+</span> Sign in with your Discord account</li>
          <li className="flex items-start gap-2"><span className="text-[#59d499] mt-0.5">+</span> Sync Discord roles with workspace roles</li>
        </ul>
      </div>
    </div>
  );
}
