"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

export default function DeleteAccountPage() {
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState(0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Delete Account</h1>
        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
      </div>

      <div className="glass card-section border border-red-500/20">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={18} className="text-red-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-400">This action is irreversible</h3>
            <p className="text-xs text-muted-foreground mt-1">Deleting your account will permanently remove:</p>
          </div>
        </div>
        <ul className="space-y-1.5 ml-8 text-xs text-muted-foreground mb-6">
          <li>Your profile and all personal data</li>
          <li>All workspaces you own (unless transferred)</li>
          <li>All uploaded files and content</li>
          <li>API keys and integrations</li>
          <li>Session history and activity logs</li>
        </ul>

        {step === 0 ? (
          <button onClick={() => setStep(1)} className="btn btn-danger text-xs">
            <Trash2 size={13} /> Delete My Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-white">Type <span className="font-mono text-red-400">DELETE</span> to confirm:</p>
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder='Type "DELETE"'
              className="w-full bg-white/5 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-white" />
            <div className="flex gap-2">
              <button disabled={confirm !== "DELETE"}
                className="btn btn-danger text-xs disabled:opacity-30">Confirm Deletion</button>
              <button onClick={() => { setStep(0); setConfirm(""); }} className="btn btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
