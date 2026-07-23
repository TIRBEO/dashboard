"use client";

import { useState, useEffect, useRef } from "react";
import { Code, Key, Terminal, Webhook, ArrowUpRight, Copy, CheckCircle2 } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, useToast, Toast } from "../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type ApiKey = { id: string; name: string; key: string; createdAt: string; lastUsedAt?: string; active: boolean };

export default function DeveloperOverview() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const fetched = useRef(false);
  const toast = useToast();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/developer/api-keys", { credentials: "include" })
      .then(r => (r.ok ? r.json() : []))
      .then(d => setKeys(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(key);
      toast.show("API key copied to clipboard");
      setTimeout(() => setCopied(""), 2000);
    });
  };

  const stats = [
    { label: "API Keys", value: keys.length, icon: <Key size={18} />, color: "var(--gold)" },
    { label: "Webhooks", value: 0, icon: <Webhook size={18} />, color: "var(--success)" },
    { label: "Active Keys", value: keys.filter(k => k.active).length, icon: <CheckCircle2 size={18} />, color: "var(--accent)" },
  ];

  return (
    <PageContainer>
      {toast.toast && <Toast message={toast.toast.message} type={toast.toast.type} onClose={toast.hide} />}

      <PageHeader title="Developer" description="API keys, webhooks, and CLI access for your account" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <Card title="Quick Start">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", flexShrink: 0 }}>
              <Key size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Create an API Key</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Generate a key to authenticate your requests</div>
            </div>
            <a href="/dashboard/developer/api-keys" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
              Create <ArrowUpRight size={12} />
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)", flexShrink: 0 }}>
              <Terminal size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Install the CLI</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Manage your account from the terminal</div>
            </div>
            <a href="/dashboard/developer/cli" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
              Install <ArrowUpRight size={12} />
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
              <Webhook size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Set up Webhooks</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Get notified when events happen on your account</div>
            </div>
            <a href="/dashboard/developer/webhooks" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
              Configure <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </Card>

      <Card title="API Reference">
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          <p>All API requests use the base URL:</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, marginBottom: 12 }}>
            <code style={{ padding: "6px 12px", borderRadius: 6, background: "var(--bg-elevated)", border: "1px solid var(--border)", fontSize: 12, color: "var(--gold)", fontFamily: "monospace" }}>
              {API}
            </code>
            <button onClick={() => copyKey(API)} className="btn btn-ghost btn-sm">
              {copied === API ? <CheckCircle2 size={12} /> : <Copy size={12} />}
            </button>
          </div>
          <p>Include your API key in the <code style={{ padding: "2px 6px", borderRadius: 4, background: "var(--bg-elevated)", fontSize: 12, color: "var(--gold)" }}>Authorization</code> header:</p>
          <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
            <div style={{ color: "var(--text-ash)" }}># Example request</div>
            <div>curl -H &quot;Authorization: Bearer YOUR_API_KEY&quot; \</div>
            <div>&nbsp;&nbsp;{API}/api/profile</div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
