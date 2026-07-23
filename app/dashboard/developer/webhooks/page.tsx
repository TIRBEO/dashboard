"use client";

import { useState, useEffect, useRef } from "react";
import { Webhook, Plus, Trash2, RotateCcw, CheckCircle, XCircle } from "lucide-react";

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

  const createWebhook = () => {
    if (!form.url) return;
    setWebhooks((prev) => [...prev, {
      id: Date.now().toString(),
      url: form.url,
      events: form.events,
      status: "active",
      lastDelivery: "Never",
      createdAt: new Date().toISOString(),
    }]);
    setShowCreate(false);
    setForm({ url: "", events: ["user.created"] });
  };

  const toggleEvent = (event: string) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(event) ? f.events.filter((e) => e !== event) : [...f.events, event],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Webhooks</h1>
        <p className="text-sm text-muted-foreground">Receive real-time event notifications via HTTP</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Webhooks ({webhooks.length})</h3>
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary text-xs"><Plus size={13} /> Add Webhook</button>
        </div>

        {showCreate && (
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 mb-4 space-y-3">
            <input placeholder="https://your-server.com/webhook" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            <div>
              <p className="text-xs text-muted-foreground mb-2">Events</p>
              <div className="flex flex-wrap gap-2">
                {EVENTS.map((ev) => (
                  <button key={ev} onClick={() => toggleEvent(ev)}
                    className={`px-2.5 py-1 rounded text-xs transition-all ${form.events.includes(ev) ? "bg-[#d8b36a] text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                    {ev}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={createWebhook} className="btn btn-primary text-xs">Create</button>
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        )}

        {webhooks.length === 0 ? (
          <div className="text-center py-12">
            <Webhook size={48} className="mx-auto mb-3" style={{ color: "#7b7e84" }} />
            <p className="text-sm text-muted-foreground">No webhooks configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div key={wh.id} className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {wh.status === "active" ? <CheckCircle size={14} className="text-[#59d499]" /> : <XCircle size={14} className="text-red-400" />}
                    <div>
                      <p className="text-sm font-mono text-white">{wh.url}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{wh.events.join(", ")} · Last: {wh.lastDelivery}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-muted-foreground" title="Test"><RotateCcw size={12} /></button>
                    <button onClick={() => setWebhooks((prev) => prev.filter((w) => w.id !== wh.id))}
                      className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
