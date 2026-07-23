"use client";

import { Zap, ExternalLink } from "lucide-react";

export default function ZapierIntegrationPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Zapier Integration</h1>
        <p className="text-sm text-muted-foreground">Automate workflows with 5,000+ app integrations</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF4A00]/20 flex items-center justify-center">
            <Zap size={24} className="text-[#FF4A00]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Zapier</p>
            <p className="text-xs text-muted-foreground">Not connected</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Connect Tirbeo to thousands of apps through Zapier. Automate repetitive tasks without code.</p>
        <button className="btn btn-primary text-xs flex items-center gap-2">
          <Zap size={13} /> Connect Zapier
        </button>
      </div>

      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-3">Popular Zaps</h3>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-[#FF4A00] mt-0.5">Zap</span> New workspace member → Send Slack message</li>
          <li className="flex items-start gap-2"><span className="text-[#FF4A00] mt-0.5">Zap</span> File uploaded → Create Google Drive copy</li>
          <li className="flex items-start gap-2"><span className="text-[#FF4A00] mt-0.5">Zap</span> Activity event → Log to Google Sheets</li>
        </ul>
      </div>
    </div>
  );
}
