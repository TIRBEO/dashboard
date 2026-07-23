"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HardDrive, Cloud, Database, Trash2, Download, Upload, Settings, Plus } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type StorageProvider = {
  id: string;
  name: string;
  type: "local" | "cloud" | "managed";
  capacity: number;
  used: number;
  status: "healthy" | "warning" | "error";
  lastSync: string;
  tier: string;
};

export default function WorkspaceStoragePage() {
  const [providers, setProviders] = useState<StorageProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", type: "cloud" as "local" | "cloud" | "managed", capacity: 1000 });
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/workspaces`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(() => setProviders([]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const create = useCallback(async () => {
    if (!form.name) return;
    setProviders((prev) => [...prev, {
      id: Date.now().toString(),
      name: form.name,
      type: form.type,
      capacity: form.capacity,
      used: 0,
      status: "healthy",
      lastSync: "Just now",
      tier: "Free",
    }]);
    setShowAdd(false);
    setForm({ name: "", type: "cloud", capacity: 1000 });
  }, [form]);

  const remove = useCallback((id: string) => {
    setProviders((prev) => prev.filter((p) => p.id !== id));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass card-section animate-pulse" style={{ height: 80 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Storage</h1>
        <p className="text-muted-foreground">Manage workspace storage providers and usage</p>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 className="text-sm font-semibold text-white">Connected Providers ({providers.length})</h3>
          <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary" style={{ fontSize: 12 }}>
            <Plus size={13} /> Add Provider
          </button>
        </div>

        {providers.length === 0 ? (
          <div className="text-center py-12">
            <Cloud size={48} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p className="text-sm text-muted-foreground">No storage providers connected</p>
            <p style={{ fontSize: 13, color: "#7b7e84", marginTop: 4 }}>Add your first provider to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {providers.map((provider) => {
              const usagePercent = provider.capacity > 0 ? Math.round((provider.used / provider.capacity) * 100) : 0;
              const barColor = usagePercent > 90 ? "#ff6161" : usagePercent > 80 ? "#d8b36a" : "#59d499";
              return (
                <div key={provider.id} className="p-4 rounded-lg bg-surface border border-hairline">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {provider.type === "cloud" ? <Cloud size={16} style={{ color: "#59d499" }} /> :
                       provider.type === "local" ? <Database size={16} style={{ color: "#d8b36a" }} /> :
                       <HardDrive size={16} style={{ color: "#4f7aff" }} />}
                      <div>
                        <p className="text-sm font-medium text-white">{provider.name}</p>
                        <p style={{ fontSize: 11, color: "#7b7e84" }}>{provider.tier} · {provider.type}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="badge" style={{ background: "rgba(89,212,153,0.15)", color: "#59d499", fontSize: 11 }}>{provider.status}</span>
                      <button onClick={() => remove(provider.id)} style={{ color: "#ff6161", background: "none", border: "none", cursor: "pointer" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "#2a2d31", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: usagePercent + "%", background: barColor, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "#7b7e84" }}>{provider.used} MB used</span>
                    <span style={{ fontSize: 11, color: "#7b7e84" }}>{provider.capacity} MB total</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showAdd && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <h4 className="text-sm font-medium text-white mb-3">Add Storage Provider</h4>
            <div className="space-y-3">
              <input placeholder="Provider name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", background: "#0a0a0c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff", fontSize: 13 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                  style={{ flex: 1, padding: "8px 12px", background: "#0a0a0c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff", fontSize: 13 }}>
                  <option value="cloud">Cloud</option>
                  <option value="local">Local</option>
                  <option value="managed">Managed</option>
                </select>
                <input type="number" placeholder="Capacity (MB)" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: parseInt(e.target.value) || 0 }))}
                  style={{ width: 120, padding: "8px 12px", background: "#0a0a0c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff", fontSize: 13 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={create} className="btn btn-primary" style={{ fontSize: 12 }}>Add</button>
                <button onClick={() => setShowAdd(false)} className="btn btn-ghost" style={{ fontSize: 12 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
