"use client";

import { useState } from "react";
import { LifeBuoy, Shield, Key, Download } from "lucide-react";

export default function RecoveryPage() {
  const [codes] = useState(["a1b2-c3d4", "e5f6-g7h8", "i9j0-k1l2", "m3n4-o5p6", "q7r8-s9t0"]);
  const [copied, setCopied] = useState(false);

  const copyCodes = () => {
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Account Recovery</h1>
        <p className="text-sm text-muted-foreground">Recovery options in case you lose access</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-4">
          <Key size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Backup Codes</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Use these one-time codes to sign in if you lose access to your 2FA device. Each code can only be used once.</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {codes.map((c) => (
            <div key={c} className="p-2 rounded bg-black/40 font-mono text-sm text-[#d8b36a] text-center">{c}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={copyCodes} className="btn btn-ghost text-xs">{copied ? "Copied!" : "Copy Codes"}</button>
          <button className="btn btn-ghost text-xs flex items-center gap-1"><Download size={12} /> Download</button>
        </div>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-3">
          <LifeBuoy size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Recovery Email</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Set a recovery email to reset your password if locked out.</p>
        <input type="email" placeholder="recovery@example.com"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-3" />
        <button className="btn btn-primary text-xs">Save Recovery Email</button>
      </div>
    </div>
  );
}
