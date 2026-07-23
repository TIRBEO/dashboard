"use client";

import { useState, useEffect, useRef } from "react";
import { Key, Plus, Trash2, Copy, Eye, EyeOff, Shield } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type ApiKey = {
  id: string;
  name: string;
  key: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsed: string;
  expiresAt: string | null;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScopes, setNewScopes] = useState(["read"]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/integrations`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(() => setKeys([]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createKey = () => {
    if (!newName) return;
    const keyId = Date.now().toString();
    const fakeKey = "tb_" + Array.from({ length: 40 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
    setKeys((prev) => [...prev, {
      id: keyId,
      name: newName,
      key: fakeKey,
      prefix: fakeKey.slice(0, 8),
      scopes: newScopes,
      createdAt: new Date().toISOString(),
      lastUsed: "Never",
      expiresAt: null,
    }]);
    setShowCreate(false);
    setNewName("");
  };

  const deleteKey = (id: string) => setKeys((prev) => prev.filter((k) => k.id !== id));

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto space-y-6">{[...Array(3)].map((_, i) => <div key={i} className="glass card-section animate-pulse" style={{ height: 80 }} />)}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">API Keys</h1>
        <p className="text-sm text-muted-foreground">Manage API keys for programmatic access</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Active Keys ({keys.length})</h3>
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary text-xs">
            <Plus size={13} /> Generate Key
          </button>
        </div>

        {showCreate && (
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 mb-4">
            <input placeholder="Key name (e.g., Production Server)" value={newName} onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-3" />
            <div className="flex gap-4 mb-3">
              {["read", "write", "admin"].map((scope) => (
                <label key={scope} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <input type="checkbox" checked={newScopes.includes(scope)}
                    onChange={(e) => setNewScopes((s) => e.target.checked ? [...s, scope] : s.filter((x) => x !== scope))}
                    className="rounded border-white/20" />
                  {scope}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={createKey} className="btn btn-primary text-xs">Create</button>
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        )}

        {keys.length === 0 ? (
          <div className="text-center py-12">
            <Key size={48} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p className="text-sm text-muted-foreground">No API keys yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <Key size={14} className="text-[#d8b36a]" />
                  <div>
                    <p className="text-sm font-medium text-white">{k.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{k.prefix}... · {k.scopes.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => copyKey(k.key, k.id)} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-muted-foreground" title="Copy key">
                    {copied === k.id ? <span className="text-xs text-[#59d499]">Copied</span> : <Copy size={12} />}
                  </button>
                  <button onClick={() => deleteKey(k.id)} className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
