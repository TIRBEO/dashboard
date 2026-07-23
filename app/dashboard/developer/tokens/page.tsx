"use client";

import { useState } from "react";
import { Shield, Plus, Trash2, Copy } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, EmptyState, Input, useToast, Toast } from "../../components";

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
  const { toast, show, hide } = useToast();

  const createToken = () => {
    if (!newName) return;
    var tok = "pat_" + Array.from({ length: 48 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
    setTokens((prev) => prev.concat([{
      id: Date.now().toString(),
      name: newName,
      token: tok,
      prefix: tok.slice(0, 12),
      scope: "Full Access",
      createdAt: new Date().toISOString(),
      expiresAt: null,
    }]));
    setShowCreate(false);
    setNewName("");
    show("Personal access token created");
  };

  const copyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <PageHeader title="Personal Access Tokens" description="Create tokens for CLI and script access" />

      <Card
        title={"Tokens (" + tokens.length + ")"}
        action={
          <Button onClick={() => setShowCreate(!showCreate)} size="sm">
            <Plus size={13} /> Create Token
          </Button>
        }
      >
        {showCreate && (
          <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Token name" value={newName} onChange={setNewName} placeholder="e.g., CI Pipeline Token" />
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={createToken} size="sm">Generate</Button>
              <Button onClick={() => setShowCreate(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </div>
        )}

        {tokens.length === 0 ? (
          <EmptyState icon={Shield} title="No personal access tokens" description="Create a token for CLI or script access" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tokens.map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Shield size={14} style={{ color: "var(--gold)" }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{t.prefix}... · {t.scope}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => copyToken(t.token, t.id)} style={{ padding: 6, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: copied === t.id ? "var(--success)" : "var(--text-muted)" }}>
                    {copied === t.id ? <span style={{ fontSize: 11 }}>Copied</span> : <Copy size={12} />}
                  </button>
                  <button onClick={() => setTokens((prev) => prev.filter((x) => x.id !== t.id))}
                    style={{ padding: 6, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
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
