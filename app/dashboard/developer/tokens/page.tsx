"use client";

import { useState, useEffect, useRef } from "react";
import { Shield, Plus, Trash2, Copy, Clock } from "lucide-react";

type Token = {
  id: string;
  name: string;
  token: string;
  prefix: string;
  scope: string;
  createdAt: string;
  expiresAt: string | null;
};

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const createToken = () => {
    if (!newName) return;
    const tok = "pat_" + Array.from({ length: 48 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
    setTokens((prev) => [...prev, {
      id: Date.now().toString(),
      name: newName,
      token: tok,
      prefix: tok.slice(0, 12),
      scope: "Full Access",
      createdAt: new Date().toISOString(),
      expiresAt: null,
    }]);
    setShowCreate(false);
    setNewName("");
  };

  const copyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Personal Access Tokens</h1>
        <p className="text-sm text-muted-foreground">Create tokens for CLI and script access</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Tokens ({tokens.length})</h3>
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary text-xs"><Plus size={13} /> Create Token</button>
        </div>

        {showCreate && (
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 mb-4 space-y-3">
            <input placeholder="Token name" value={newName} onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            <div className="flex gap-2">
              <button onClick={createToken} className="btn btn-primary text-xs">Generate</button>
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        )}

        {tokens.length === 0 ? (
          <div className="text-center py-12">
            <Shield size={48} className="mx-auto mb-3" style={{ color: "#7b7e84" }} />
            <p className="text-sm text-muted-foreground">No personal access tokens</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tokens.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <Shield size={14} className="text-[#d8b36a]" />
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{t.prefix}... · {t.scope}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => copyToken(t.token, t.id)} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-muted-foreground">
                    {copied === t.id ? <span className="text-xs text-[#59d499]">Copied</span> : <Copy size={12} />}
                  </button>
                  <button onClick={() => setTokens((prev) => prev.filter((x) => x.id !== t.id))}
                    className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
