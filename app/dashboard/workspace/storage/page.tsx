"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HardDrive, Cloud, Database, Trash2, Download, Upload, Settings, Plus, X } from "lucide-react";

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

    fetch(`${API}/api/workspaces/1/storage/providers`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setProviders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const create = useCallback(async () => {
    if (!form.name) return;
    try {
      const res = await fetch(`${API}/api/workspaces/1/storage/providers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newProvider = await res.json();
        setProviders((prev) => [...prev, newProvider]);
        setShowAdd(false);
        setForm({ name: "", type: "cloud", capacity: 1000 });
      }
    } catch {
    }
  }, [form]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "#59d499";
      case "warning": return "#d8b36a";
      case "error": return "#ff6161";
      default: return "#7b7e84";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "local": return <Database size={16} />;
      case "cloud": return <Cloud size={16} />;
      case "managed": return <HardDrive size={16} />;
      default: return <HardDrive size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass card-section animate-in">
            <div className="skeleton" style={{ height: 80 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h1>Storage Providers</h1>
        <p>Manage your workspace's connected storage</p>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Connected Providers</h3>
            <p style={{ fontSize: 13, color: "#7b7e84", margin: "4px 0 0" }}>{providers.length} total providers</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary">
            <Plus size={13} /> Add Provider
          </button>
        </div>

        {providers.length === 0 ? (
          <div className="text-center py-12">
            <Cloud size={48} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "var(--text-muted)" }}>No storage providers connected</p>
            <p style={{ fontSize: 13, color: "var(--text-ash)", marginTop: 4 }}>Add your first storage provider to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => {
              const usagePercent = Math.round((provider.used / provider.capacity) * 100);
              return (
                <div key={provider.id} className="p-4 rounded bg-surface-elevated">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          padding: "8px",
                          borderRadius: 8,
                          background: usagePercent > 80 ? "rgba(255,97,97,0.1)" : "rgba(216,179,106,0.1)",
                        }}
                      >
                        {getTypeIcon(provider.type)}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{provider.name}</p>
                        <p style={{ fontSize: 12, color: "#7b7e84", marginTop: 2 }}>{provider.tier} tier</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className="badge" style={{ background: getStatusColor(provider.status) + "20", color: getStatusColor(provider.status) }}>
                          {provider.status}
                        </span>
                        <button className="btn btn-ghost" style={{ height: 28, padding: "0 8px" }}>
                          <Settings size={12} />
                        </button>
                        <button className="btn btn-danger" style={{ height: 28, padding: "0 8px" }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p style={{ fontSize: 11, color: "#7b7e84" }}>Sync: {provider.lastSync}</p>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "#9c9c9d" }}>Usage</span>
                      <span style={{ fontSize: 11, color: "#9c9c9d" }}>{usagePercent}%</span>
                    </div>
                    <div style={{ height: 6, background: "#2a2d31", borderRadius: 3, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          background: usagePercent > 90 ? "#ff6161" : usagePercent > 80 ? "#d8b36a" : "#59d499",
                          width: `${usagePercent}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "#7b7e84" }}>{(provider.used / 1024).toFixed(1)} GB used</span>
                      <span style={{ fontSize: 11, color: "#7b7e84" }}>{(provider.capacity / 1024).toFixed(1)} GB total</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showAdd && (
          <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: "0 0 12px" }}>Add Storage Provider</h3>
            <div className="space-y-3">
              <input
                placeholder="Provider name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field"
              />
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "local" | "cloud" | "managed" }))}
                  className="input-field"
                  style={{ flex: 1 }}
                >
                  <option value="cloud">Cloud Storage</option>
                  <option value="local">Local Storage</option>
                  <option value="managed">Managed Service</option>
                </select>
                <input
                  type="number"
                  placeholder="Capacity (GB)"
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: parseInt(e.target.value) || 0 }))}
                  className="input-field"
                  style={{ width: 120 }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={create} className="btn btn-primary">Add Provider</button>
                <button onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass card-section">
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: "0 0 16px" }}>Storage Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <button className="btn btn-primary" style={{ height: 40 }}>
            <Upload size={14} /> Import Data
          </button>
          <button className="btn btn-primary" style={{ height: 40 }}>
            <Download size={14} /> Export Data
          </button>
          <button className="btn btn-ghost" style={{ height: 40 }}>
            <Database size={14} /> Database Backup
          </button>
          <button className="btn btn-ghost" style={{ height: 40 }}>
            <Settings size={14} /> Storage Settings
          </button>
        </div>
      </div>
    </div>
  );
}
