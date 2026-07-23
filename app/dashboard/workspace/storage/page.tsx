"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Cloud, Database, HardDrive, Trash2, Plus } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState, Skeleton, Input, Select, useToast, Toast } from "../../components";

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
  const [form, setForm] = useState({ name: "", type: "cloud", capacity: 1000 });
  const { toast, show, hide } = useToast();
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/workspaces", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(() => setProviders([]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const create = useCallback(() => {
    if (!form.name) return;
    setProviders((prev) => prev.concat([{
      id: Date.now().toString(),
      name: form.name,
      type: form.type as "local" | "cloud" | "managed",
      capacity: form.capacity,
      used: 0,
      status: "healthy",
      lastSync: "Just now",
      tier: "Free",
    }]));
    setShowAdd(false);
    setForm({ name: "", type: "cloud", capacity: 1000 });
    show("Storage provider added");
  }, [form, show]);

  const remove = useCallback((id: string) => {
    setProviders((prev) => prev.filter((p) => p.id !== id));
    show("Provider removed");
  }, [show]);

  if (loading) return <PageContainer><Skeleton count={3} height={80} /></PageContainer>;

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <PageHeader title="Storage" description="Manage workspace storage providers and usage" />

      <Card
        title={"Connected Providers (" + providers.length + ")"}
        action={
          <Button onClick={() => setShowAdd(!showAdd)} size="sm">
            <Plus size={13} /> Add Provider
          </Button>
        }
      >
        {providers.length === 0 ? (
          <EmptyState icon={Cloud} title="No storage providers connected" description="Add your first provider to get started" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {providers.map((provider) => {
              var usagePercent = provider.capacity > 0 ? Math.round((provider.used / provider.capacity) * 100) : 0;
              var barColor = usagePercent > 90 ? "var(--danger)" : usagePercent > 80 ? "var(--gold)" : "var(--success)";
              var TypeIcon = provider.type === "cloud" ? Cloud : provider.type === "local" ? Database : HardDrive;
              var iconColor = provider.type === "cloud" ? "var(--success)" : provider.type === "local" ? "var(--gold)" : "var(--info)";
              return (
                <div key={provider.id} style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <TypeIcon size={16} style={{ color: iconColor }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{provider.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{provider.tier} · {provider.type}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Badge variant="success" style={{ fontSize: 11 }}>{provider.status}</Badge>
                      <button onClick={() => remove(provider.id)} style={{ padding: 4, background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: usagePercent + "%", background: barColor, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{provider.used} MB used</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{provider.capacity} MB total</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showAdd && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 12 }}>Add Storage Provider</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="Provider name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g., S3 Bucket" />
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Select label="Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} options={[{ label: "Cloud", value: "cloud" }, { label: "Local", value: "local" }, { label: "Managed", value: "managed" }]} />
                </div>
                <div style={{ width: 140 }}>
                  <Input label="Capacity (MB)" value={String(form.capacity)} onChange={(v) => setForm((f) => ({ ...f, capacity: parseInt(v) || 0 }))} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button onClick={create} size="sm">Add</Button>
                <Button onClick={() => setShowAdd(false)} variant="ghost" size="sm">Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
