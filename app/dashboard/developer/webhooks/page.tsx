"use client";

import { useState } from "react";
import { Webhook, Plus, Trash2, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState, Input, useToast, Toast } from "../../components";

type WebhookEntry = {
  id: string;
  url: string;
  events: string[];
  status: "active" | "failed";
  lastDelivery: string;
  createdAt: string;
};

const EVENTS = ["user.created", "user.updated", "workspace.member_added", "workspace.member_removed", "message.sent", "file.uploaded"];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ url: "", events: ["user.created"] });
  const { toast, show, hide } = useToast();

  const createWebhook = () => {
    if (!form.url) return;
    setWebhooks((prev) => prev.concat([{
      id: Date.now().toString(),
      url: form.url,
      events: form.events,
      status: "active",
      lastDelivery: "Never",
      createdAt: new Date().toISOString(),
    }]));
    setShowCreate(false);
    setForm({ url: "", events: ["user.created"] });
    show("Webhook created successfully");
  };

  const toggleEvent = (event: string) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(event) ? f.events.filter((e) => e !== event) : f.events.concat([event]),
    }));
  };

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <PageHeader title="Webhooks" description="Receive real-time event notifications via HTTP" />

      <Card
        title={"Webhooks (" + webhooks.length + ")"}
        action={
          <Button onClick={() => setShowCreate(!showCreate)} size="sm">
            <Plus size={13} /> Add Webhook
          </Button>
        }
      >
        {showCreate && (
          <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Endpoint URL" value={form.url} onChange={(v) => setForm((f) => ({ ...f, url: v }))} placeholder="https://your-server.com/webhook" />
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Events</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EVENTS.map((ev) => (
                  <button key={ev} onClick={() => toggleEvent(ev)}
                    style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: "none",
                      background: form.events.includes(ev) ? "var(--gold)" : "rgba(255,255,255,0.05)",
                      color: form.events.includes(ev) ? "#000" : "var(--text-muted)",
                      fontWeight: form.events.includes(ev) ? 600 : 400,
                    }}>
                    {ev}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={createWebhook} size="sm">Create</Button>
              <Button onClick={() => setShowCreate(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </div>
        )}

        {webhooks.length === 0 ? (
          <EmptyState icon={Webhook} title="No webhooks configured" description="Add a webhook to receive event notifications" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {webhooks.map((wh) => (
              <div key={wh.id} style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {wh.status === "active" ? <CheckCircle size={14} style={{ color: "var(--success)" }} /> : <XCircle size={14} style={{ color: "var(--danger)" }} />}
                    <div>
                      <p style={{ fontSize: 13, fontFamily: "monospace", color: "var(--text)" }}>{wh.url}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{wh.events.join(", ")} · Last: {wh.lastDelivery}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button style={{ padding: 6, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "var(--text-muted)" }} title="Test">
                      <RotateCcw size={12} />
                    </button>
                    <button onClick={() => setWebhooks((prev) => prev.filter((w) => w.id !== wh.id))}
                      style={{ padding: 6, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
