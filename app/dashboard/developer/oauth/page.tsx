"use client";

import { useState, useEffect, useRef } from "react";
import { AppWindow, Plus, Trash2 } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, EmptyState, Skeleton, Input, useToast, Toast } from "../../components";

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
  const { toast, show, hide } = useToast();
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/integrations", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(() => setApps([]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createApp = () => {
    if (!form.name) return;
    setApps((prev) => prev.concat([{
      id: Date.now().toString(),
      name: form.name,
      clientId: "tb_client_" + Math.random().toString(36).slice(2, 14),
      redirectUri: form.redirectUri || "http://localhost:3000/callback",
      scopes: ["read", "write"],
      createdAt: new Date().toISOString(),
      status: "active",
    }]));
    setShowCreate(false);
    setForm({ name: "", redirectUri: "" });
    show("OAuth app created successfully");
  };

  const deleteApp = (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    show("OAuth app deleted");
  };

  if (loading) return <PageContainer><Skeleton count={2} height={120} /></PageContainer>;

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <PageHeader title="OAuth Applications" description="Register and manage OAuth 2.0 applications" />

      <Card
        title={"Your Apps (" + apps.length + ")"}
        action={
          <Button onClick={() => setShowCreate(!showCreate)} size="sm">
            <Plus size={13} /> New App
          </Button>
        }
      >
        {showCreate && (
          <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Application name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="My App" />
            <Input label="Redirect URI" value={form.redirectUri} onChange={(v) => setForm((f) => ({ ...f, redirectUri: v }))} placeholder="https://yourapp.com/callback" />
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={createApp} size="sm">Create App</Button>
              <Button onClick={() => setShowCreate(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </div>
        )}

        {apps.length === 0 ? (
          <EmptyState icon={AppWindow} title="No OAuth apps registered" description="Register your first app to enable OAuth flows" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {apps.map((app) => (
              <div key={app.id} style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{app.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2 }}>Client ID: {app.clientId}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Redirect: {app.redirectUri}</p>
                  </div>
                  <button onClick={() => deleteApp(app.id)} style={{ padding: 6, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
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
