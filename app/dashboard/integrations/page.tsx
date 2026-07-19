"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link2, Unlink } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Integration = { id: string; provider: string; connected: boolean; createdAt: string };

const PROVIDERS = [
  { id: "google", name: "Google", color: "#4285F4" },
  { id: "github", name: "GitHub", color: "#fff" },
  { id: "slack", name: "Slack", color: "#E01E5A" },
  { id: "discord", name: "Discord", color: "#5865F2" },
  { id: "zapier", name: "Zapier", color: "#FF4A00" },
  { id: "notion", name: "Notion", color: "#fff" },
  { id: "linear", name: "Linear", color: "#5E6AD2" },
  { id: "figma", name: "Figma", color: "#A259FF" },
  { id: "openai", name: "OpenAI", color: "#10A37F" },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/integrations`, { credentials: "include" }).then(r => r.ok ? r.json() : []).then(setIntegrations).catch(() => {});
  }, []);

  const isConnected = (id: string) => integrations.some(i => i.provider === id && i.connected);

  const toggle = useCallback(async (provider: string, connected: boolean) => {
    setLoading(provider);
    try {
      if (connected) {
        await fetch(`${API}/api/integrations`, {
          method: "DELETE", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider }),
        });
        setIntegrations(prev => prev.filter(i => i.provider !== provider));
      } else {
        const res = await fetch(`${API}/api/integrations`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, connected: true }),
        });
        if (res.ok) { const data = await res.json(); setIntegrations(prev => [...prev, data]); }
      }
      setToast(connected ? `${provider} disconnected` : `${provider} connected`);
    } catch { setToast("Failed"); }
    setLoading(null);
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <div className="space-y-5">
      <div className="section-header">
        <h1>Integrations</h1>
        <p>Connected apps and services</p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {PROVIDERS.map(p => {
          const connected = isConnected(p.id);
          return (
            <div key={p.id} className="glass" style={{ padding: "16px 18px" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: p.color }}>
                    {p.name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{connected ? "Connected" : "Not connected"}</p>
                  </div>
                </div>
                <span className={`badge ${connected ? "badge-success" : "badge-default"}`}>{connected ? "Active" : "Off"}</span>
              </div>
              <button onClick={() => toggle(p.id, connected)} disabled={loading === p.id}
                className={`btn ${connected ? "btn-danger" : "btn-primary"} w-full`} style={{ height: 32, fontSize: 12 }}>
                {loading === p.id ? "..." : connected ? <><Unlink size={11} />Disconnect</> : <><Link2 size={11} />Connect</>}
              </button>
            </div>
          );
        })}
      </div>

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  );
}
