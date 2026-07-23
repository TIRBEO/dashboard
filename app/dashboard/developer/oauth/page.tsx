"use client";

import { useState, useEffect, useRef } from "react";
import { AppWindow, Plus, Trash2, ExternalLink } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type OAuthApp = {
  id: string;
  name: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  createdAt: string;
  status: "active" | "inactive";
};

export default function OAuthAppsPage() {
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", redirectUri: "" });
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/integrations`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(() => setApps([]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createApp = () => {
    if (!form.name) return;
    setApps((prev) => [...prev, {
      id: Date.now().toString(),
      name: form.name,
      clientId: "tb_client_" + Math.random().toString(36).slice(2, 14),
      redirectUri: form.redirectUri || "http://localhost:3000/callback",
      scopes: ["read", "write"],
      createdAt: new Date().toISOString(),
      status: "active",
    }]);
    setShowCreate(false);
    setForm({ name: "", redirectUri: "" });
  };

  const deleteApp = (id: string) => setApps((prev) => prev.filter((a) => a.id !== id));

  if (loading) return <div className="max-w-4xl mx-auto"><div className="glass card-section animate-pulse" style={{ height: 200 }} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">OAuth Applications</h1>
        <p className="text-sm text-muted-foreground">Register and manage OAuth 2.0 applications</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Your Apps ({apps.length})</h3>
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary text-xs"><Plus size={13} /> New App</button>
        </div>

        {showCreate && (
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 mb-4 space-y-3">
            <input placeholder="Application name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            <input placeholder="Redirect URI (https://yourapp.com/callback)" value={form.redirectUri} onChange={(e) => setForm((f) => ({ ...f, redirectUri: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            <div className="flex gap-2">
              <button onClick={createApp} className="btn btn-primary text-xs">Create App</button>
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        )}

        {apps.length === 0 ? (
          <div className="text-center py-12">
            <AppWindow size={48} className="mx-auto mb-3" style={{ color: "#7b7e84" }} />
            <p className="text-sm text-muted-foreground">No OAuth apps registered</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((app) => (
              <div key={app.id} className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{app.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">Client ID: {app.clientId}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Redirect: {app.redirectUri}</p>
                  </div>
                  <button onClick={() => deleteApp(app.id)} className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
