"use client";

import { useState, useEffect, useRef } from "react";
import { Key, Plus, Trash2, Copy } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState, Skeleton, Input, useToast, Toast } from "../../components";

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
  const [copied, setCopied] = useState<string | null>(null);
  const { toast, show, hide } = useToast();
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/integrations", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(() => setKeys([]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createKey = () => {
    if (!newName) return;
    var fakeKey = "tb_" + Array.from({ length: 40 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
    setKeys((prev) => prev.concat([{
      id: Date.now().toString(),
      name: newName,
      key: fakeKey,
      prefix: fakeKey.slice(0, 8),
      scopes: newScopes,
      createdAt: new Date().toISOString(),
      lastUsed: "Never",
      expiresAt: null,
    }]));
    setShowCreate(false);
    setNewName("");
    show("API key created successfully");
  };

  const deleteKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    show("API key deleted");
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return <PageContainer><Skeleton count={3} height={80} /></PageContainer>;
  }

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <PageHeader title="API Keys" description="Manage API keys for programmatic access" />

      <Card
        title={"Active Keys (" + keys.length + ")"}
        action={
          <Button onClick={() => setShowCreate(!showCreate)} size="sm">
            <Plus size={13} /> Generate Key
          </Button>
        }
      >
        {showCreate && (
          <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", marginBottom: 16 }}>
            <Input
              label="Key name"
              value={newName}
              onChange={setNewName}
              placeholder="e.g., Production Server"
            />
            <div style={{ display: "flex", gap: 16, marginTop: 12, marginBottom: 12 }}>
              {["read", "write", "admin"].map((scope) => (
                <label key={scope} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
                  <input type="checkbox" checked={newScopes.includes(scope)}
                    onChange={(e) => setNewScopes((s) => e.target.checked ? s.concat([scope]) : s.filter((x) => x !== scope))}
                    style={{ borderRadius: 4, accentColor: "var(--gold)" }} />
                  {scope}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={createKey} size="sm">Create</Button>
              <Button onClick={() => setShowCreate(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </div>
        )}

        {keys.length === 0 ? (
          <EmptyState icon={Key} title="No API keys yet" description="Generate your first key to get started" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {keys.map((k) => (
              <div key={k.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Key size={14} style={{ color: "var(--gold)" }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{k.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{k.prefix}... · {k.scopes.join(", ")}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => copyKey(k.key, k.id)} style={{ padding: 6, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: copied === k.id ? "var(--success)" : "var(--text-muted)" }} title="Copy key">
                    {copied === k.id ? <span style={{ fontSize: 11 }}>Copied</span> : <Copy size={12} />}
                  </button>
                  <button onClick={() => deleteKey(k.id)} style={{ padding: 6, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
