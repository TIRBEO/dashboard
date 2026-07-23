"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Palette, Trash2, Plus, Globe, Download, Eye } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState, Skeleton, Input, Select, useToast, Toast } from "../../components";

var API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Branding = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  isPublic: boolean;
  customDomainStatus: string;
  updatedAt: string;
};

export default function WorkspaceBrandingPage() {
  const [brandings, setBrandings] = useState<Branding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#d8b36a");
  const [secondaryColor, setSecondaryColor] = useState("#f2eee8");
  const [fontFamily, setFontFamily] = useState("Inter");
  const { toast, show, hide } = useToast();
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/workspaces/1/branding/workspaces", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBrandings(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const create = useCallback(() => {
    if (!name) return;
    fetch(API + "/api/workspaces/1/branding/workspaces", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, primaryColor: primaryColor, secondaryColor: secondaryColor, fontFamily: fontFamily }),
    }).then((res) => {
      if (res.ok) return res.json();
      throw new Error("Failed");
    }).then((b) => {
      setBrandings((prev) => prev.concat([b]));
      setShowCreate(false);
      setName("");
      show("Branding created");
    }).catch(() => show("Failed to create branding", "error"));
  }, [name, primaryColor, secondaryColor, fontFamily, show]);

  const removeBranding = (id: string) => {
    setBrandings((prev) => prev.filter((b) => b.id !== id));
    show("Branding deleted");
  };

  if (loading) return <PageContainer><Skeleton count={3} height={80} /></PageContainer>;

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <PageHeader title="Workspace Branding" description="Manage your workspace custom branding and domains" />

      <Card
        title={"Your Brandings (" + brandings.length + ")"}
        action={
          <Button onClick={() => setShowCreate(!showCreate)} size="sm">
            <Plus size={13} /> New Branding
          </Button>
        }
      >
        {brandings.length === 0 ? (
          <EmptyState icon={Palette} title="No custom brandings created" description="Create your first branding to customize the look" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {brandings.map((b) => (
              <div key={b.id} style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: b.primaryColor }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{b.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.fontFamily} font</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Badge>{b.isPublic ? "Public" : "Private"}</Badge>
                    <button onClick={() => removeBranding(b.id)} style={{ padding: 6, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreate && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Workspace name" value={name} onChange={setName} placeholder="My Brand Workspace" />
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Primary Color</label>
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{ width: "100%", height: 36, borderRadius: 8, cursor: "pointer", background: "transparent", border: "1px solid var(--border)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Secondary Color</label>
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)}
                  style={{ width: "100%", height: 36, borderRadius: 8, cursor: "pointer", background: "transparent", border: "1px solid var(--border)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <Select label="Font Family" value={fontFamily} onChange={setFontFamily} options={[{ label: "Inter", value: "Inter" }, { label: "System", value: "System" }, { label: "JetBrains Mono", value: "JetBrains Mono" }]} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={create} size="sm">Create Branding</Button>
              <Button onClick={() => setShowCreate(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </div>
        )}
      </Card>

      <Card title="Quick Actions">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Button variant="primary" size="sm"><Palette size={13} /> Upload Logo</Button>
          <Button variant="primary" size="sm"><Globe size={13} /> Configure Domain</Button>
          <Button variant="ghost" size="sm"><Download size={13} /> Download Assets</Button>
          <Button variant="ghost" size="sm"><Eye size={13} /> Preview Branding</Button>
        </div>
      </Card>
    </PageContainer>
  );
}
