"use client";

import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

type Ticket = { id: string; subject: string; status: "open" | "in_progress" | "resolved"; createdAt: string; lastReply: string };

export default function TicketsPage() {
  const [tickets] = useState<Ticket[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "" });

  const statusIcon = (s: string) => {
    if (s === "open") return <AlertCircle size={12} className="text-[#d8b36a]" />;
    if (s === "in_progress") return <Clock size={12} className="text-[#4f7aff]" />;
    return <CheckCircle size={12} className="text-[#59d499]" />;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">Get help from our support team</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary text-xs"><Plus size={13} /> New Ticket</button>
      </div>

      {showCreate && (
        <div className="glass card-section space-y-3">
          <input placeholder="Subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
          <textarea placeholder="Describe your issue..." value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white h-32 resize-none" />
          <div className="flex gap-2">
            <button className="btn btn-primary text-xs">Submit Ticket</button>
            <button onClick={() => setShowCreate(false)} className="btn btn-ghost text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="glass card-section">
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto mb-3" style={{ color: "#7b7e84" }} />
            <p className="text-sm text-muted-foreground">No support tickets</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  {statusIcon(t.status)}
                  <div>
                    <p className="text-sm font-medium text-white">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.lastReply}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-muted-foreground capitalize">{t.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
