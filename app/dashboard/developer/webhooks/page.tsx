"use client";

import { useState, useEffect, useRef } from "react";
import { Webhook, Plus, Trash2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState, Toast, useToast } from "../../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type WebhookEntry = {
  id: string; url: string; events: string[]; active: boolean;
  createdAt: string; lastTriggeredAt?: string; secret?: string;
};

const AVAILABLE_EVENTS = [
  "user.created", "user.updated", "user.deleted",
  "profile.updated", "password.changed", "2fa.enabled", "2fa.disabled",
  "session.created", "session.revoked",
  "notification.created", "api_key.created", "api_key.revoked",
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const fetched = useRef(false);
  const toast = useToast();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/developer/webhooks", { credentials: "include" })
      .then(r => (r.ok ? r.json() : []))
      .then(d => setWebhooks(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createWebhook = async () => {
    if (!newUrl.trim() || newEvents.length === 0) return;
    try {
      const res = await fetch(API + "/api/developer/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url: newUrl.trim(), events: newEvents }),
      });
      if (res.ok) {
        const data = await res.json();
        setWebhooks(prev => [data, ...prev]);
        setShowCreate(false);
        setNewUrl("");
        setNewEvents([]);
        toast.show("Webhook created");
      } else {
        toast.show("Failed to create webhook", "error");
      }
    } catch {
      toast.show("Connection error", "error");
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!window.confirm("Delete this webhook?")) return;
    try {
      const res = await fetch(API + "/api/developer/webhooks/" + id, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setWebhooks(prev => prev.filter(w => w.id !== id));
        toast.show("Webhook deleted");
      }
    } catch {
      toast.show("Failed to delete webhook", "error");
    }
  };

  const toggleEvent = (event: string) => {
    setNewEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]);
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(API + "/api/developer/webhooks/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active: !current }),
      });
      if (res.ok) {
        setWebhooks(prev => prev.map(w => w.id === id ? { ...w, active: !current } : w));
      }
    } catch {}
  };

  return (
    <PageContainer>
      {toast.toast && <Toast message={toast.toast.message} type={toast.toast.type} onClose={toast.hide} />}

      <PageHeader title="Webhooks" description="Receive HTTP callbacks when events happen on your account"
        action={<Button onClick={() => setShowCreate(true)}><Plus size={14} /> New Webhook</Button>} />

      {showCreate && (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Endpoint URL</label>
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://your-server.com/webhook"
                className="input-field" autoFocus />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Events</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {AVAILABLE_EVENTS.map(evt => (
                  <button key={evt} onClick={() => toggleEvent(evt)}
                    className={"btn btn-sm " + (newEvents.includes(evt) ? "btn-primary" : "btn-ghost")}
                    style={{ fontSize: 11, fontFamily: "monospace" }}>
                    {evt}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={createWebhook} disabled={!newUrl.trim() || newEvents.length === 0}>Create Webhook</Button>
              <Button variant="ghost" onClick={() => { setShowCreate(false); setNewUrl(""); setNewEvents([]); }}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <Card title="Webhooks" subtitle={webhooks.length + " webhook" + (webhooks.length !== 1 ? "s" : "")}>
        {webhooks.length === 0 && !loading ? (
          <EmptyState icon={Webhook} title="No webhooks" description="Create a webhook to receive event notifications." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {webhooks.map(w => (
              <div key={w.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", borderRadius: 10, background: "var(--bg-elevated)",
                border: "1px solid var(--border)", gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", fontFamily: "monospace" }}>{w.url}</span>
                    <ExternalLink size={11} style={{ color: "var(--text-ash)" }} />
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {w.events.map(evt => (
                      <span key={evt} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--accent-muted)", color: "var(--text-muted)", fontFamily: "monospace" }}>{evt}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => toggleActive(w.id, w.active)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                    title={w.active ? "Disable" : "Enable"}>
                    {w.active ? <CheckCircle2 size={16} style={{ color: "var(--success)" }} /> : <XCircle size={16} style={{ color: "var(--text-ash)" }} />}
                  </button>
                  <button onClick={() => deleteWebhook(w.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-ash)", padding: 4 }}>
                    <Trash2 size={14} />
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
