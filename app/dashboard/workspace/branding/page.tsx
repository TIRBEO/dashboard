"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Palette, Type, Layout, Eye, Accessibility, Upload, Trash2, Check, RotateCcw, Plus, Globe } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type WorkspaceBranding = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  fontFamily: string;
  customDomain?: string;
  customDomainStatus: "pending" | "verified" | "failed";
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function WorkspaceBrandingPage() {
  const [brandings, setBrandings] = useState<WorkspaceBranding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", primaryColor: "#d8b36a", secondaryColor: "#f2eee8", fontFamily: "Inter" });
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/workspaces/1/branding/workspaces`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setBrandings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const create = useCallback(async () => {
    if (!form.name) return;
    try {
      const res = await fetch(`${API}/api/workspaces/1/branding/workspaces", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newBranding = await res.json();
        setBrandings((prev) => [...prev, newBranding]);
        setShowCreate(false);
        setForm({ name: "", primaryColor: "#d8b36a", secondaryColor: "#f2eee8", fontFamily: "Inter" });
      }
    } catch {
    }
  }, [form]);

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
        <h1>Workspace Branding</h1>
        <p>Manage your workspace's custom branding and domains</p>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Your Brandings</h3>
            <p style={{ fontSize: 13, color: "#7b7e84", margin: "4px 0 0" }}>{brandings.length} custom workspaces</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
            <Plus size={13} /> New Branding
          </button>
        </div>

        {brandings.length === 0 ? (
          <div className="text-center py-12">
            <Palette size={48} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "var(--text-muted)" }}>No custom brandings created</p>
            <p style={{ fontSize: 13, color: "var(--text-ash)", marginTop: 4 }}>Create your first workspace branding</p>
          </div>
        ) : (
          <div className="space-y-4">
            {brandings.map((branding) => (
              <div key={branding.id} className="p-4 rounded bg-surface-elevated">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: branding.primaryColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {branding.logoUrl ? (
                        <img
                          src={branding.logoUrl}
                          alt={branding.name}
                          style={{ width: "24px", height: "24px", borderRadius: 4 }}
                        />
                      ) : (
                        <Palette size={20} color="#0b0b0d" />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{branding.name}</p>
                      <p style={{ fontSize: 12, color: "#7b7e84", marginTop: 2 }}>{branding.fontFamily} font</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className={`badge ${branding.isPublic ? "badge-success" : "badge-default"}`} style={{ fontSize: 10 }}>{branding.isPublic ? "Public" : "Private"}</span>
                      <span className={`badge ${branding.customDomainStatus === "verified" ? "badge-success" : branding.customDomainStatus === "pending" ? "badge-default" : "badge-danger"}`} style={{ fontSize: 10 }}>
                        <Globe size={8} style={{ marginRight: 4 }} /> {branding.customDomainStatus}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: "#7b7e84" }}>Updated {new Date(branding.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="btn btn-ghost" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>
                    Edit
                  </button>
                  <button className="btn btn-ghost" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>
                    Preview
                  </button>
                  <button className="btn btn-danger" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreate && (
          <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: "0 0 12px" }}>Create New Branding</h3>
            <div className="space-y-3">
              <input
                placeholder="Workspace name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field"
              />
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#9c9c9d", marginBottom: 4, display: "block" }}>Primary Color</label>
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                    style={{ width: "100%", height: 36, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#9c9c9d", marginBottom: 4, display: "block" }}>Secondary Color</label>
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => setForm((f) => ({ ...f, secondaryColor: e.target.value }))}
                    style={{ width: "100%", height: 36, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#9c9c9d", marginBottom: 4, display: "block" }}>Font Family</label>
                <select
                  value={form.fontFamily}
                  onChange={(e) => setForm((f) => ({ ...f, fontFamily: e.target.value }))}
                  className="input-field"
                  style={{ height: 36 }}
                >
                  <option value="Inter">Inter</option>
                  <option value="System">System</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="SF Pro">SF Pro</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={create} className="btn btn-primary">Create Branding</button>
                <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass card-section">
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: "0 0 16px" }}>Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <button className="btn btn-primary" style={{ height: 40 }}>
            <Upload size={14} /> Upload Logo
          </button>
          <button className="btn btn-primary" style={{ height: 40 }}>
            <Globe size={14} /> Configure Domain
          </button>
          <button className="btn btn-ghost" style={{ height: 40 }}>
            <Download size={14} /> Download Assets
          </button>
          <button className="btn btn-ghost" style={{ height: 40 }}>
            <Eye size={14} /> Preview Branding
          </button>
        </div>
      </div>
    </div>
  );
}
