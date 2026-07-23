"use client";

import { useState, useEffect, useRef } from "react";
import { Key, Plus, Trash2, Copy, CheckCircle2, Eye, EyeOff, RefreshCw } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState, Toast, useToast } from "../../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type ApiKey = {
  id: string; name: string; key: string; prefix: string;
  createdAt: string; lastUsedAt?: string; active: boolean;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState("");
  const fetched = useRef(false);
  const toast = useToast();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchKeys();
  }, []);

  const fetchKeys = () => {
    setLoading(true);
    fetch(API + "/api/developer/api-keys", { credentials: "include" })
      .then(r => (r.ok ? r.json() : []))
      .then(d => setKeys(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const createKey = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(API + "/api/developer/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key || data.rawKey || "");
        setNewName("");
        fetchKeys();
        toast.show("API key created");
      } else {
        toast.show("Failed to create key", "error");
      }
    } catch {
      toast.show("Connection error", "error");
    }
  };

  const deleteKey = async (id: string, name: string) => {
    if (!window.confirm(`Delete API key "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(API + "/api/developer/api-keys/" + id, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setKeys(prev => prev.filter(k => k.id !== id));
        toast.show("Key deleted");
      }
    } catch {
      toast.show("Failed to delete key", "error");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      toast.show("Copied to clipboard");
      setTimeout(() => setCopiedId(""), 2000);
    });
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <PageContainer>
      {toast.toast && <Toast message={toast.toast.message} type={toast.toast.type} onClose={toast.hide} />}

      <PageHeader title="API Keys" description="Manage API keys for programmatic access"
        action={<Button onClick={() => setShowCreate(true)}><Plus size={14} /> New Key</Button>} />

      {showCreate && (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Key Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. My App, CI Pipeline, Dev Server"
                className="input-field" autoFocus onKeyDown={e => { if (e.key === "Enter") createKey(); if (e.key === "Escape") setShowCreate(false); }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={createKey} disabled={!newName.trim()}>Create Key</Button>
              <Button variant="ghost" onClick={() => { setShowCreate(false); setNewName(""); }}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {newKey && (
        <Card>
          <div style={{ padding: "4px 0" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--success)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={14} /> API key created successfully
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Copy this key now. It won't be shown again.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <code style={{ flex: 1, padding: "8px 12px", borderRadius: 6, background: "var(--bg-elevated)", border: "1px solid var(--border)", fontSize: 12, color: "var(--gold)", fontFamily: "monospace", wordBreak: "break-all" }}>
                {newKey}
              </code>
              <button onClick={() => copyToClipboard(newKey, "new")} className="btn btn-ghost btn-sm">
                {copiedId === "new" ? <CheckCircle2 size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <button onClick={() => setNewKey("")} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>Dismiss</button>
          </div>
        </Card>
      )}

      <Card title="Active Keys" subtitle={keys.length + " key" + (keys.length !== 1 ? "s" : "")}>
        {keys.length === 0 && !loading ? (
          <EmptyState icon={Key} title="No API keys" description="Create an API key to start making authenticated requests." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {keys.map(k => {
              const isRevealed = revealedKeys.has(k.id);
              const displayKey = isRevealed ? k.key : (k.prefix || k.key.slice(0, 8)) + "••••••••••••";
              return (
                <div key={k.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", borderRadius: 10, background: "var(--bg-elevated)",
                  border: "1px solid var(--border)", gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{k.name}</span>
                      {k.active ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Revoked</Badge>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <code style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{displayKey}</code>
                      <button onClick={() => toggleReveal(k.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-ash)", padding: 2 }}>
                        {isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 4 }}>
                      Created {formatDate(k.createdAt)}{k.lastUsedAt ? " · Last used " + formatDate(k.lastUsedAt) : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => copyToClipboard(k.key, k.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 6, borderRadius: 6 }} title="Copy key">
                      {copiedId === k.id ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    </button>
                    <button onClick={() => deleteKey(k.id, k.name)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-ash)", padding: 6, borderRadius: 6 }} title="Delete key">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
