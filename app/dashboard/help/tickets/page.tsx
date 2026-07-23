"use client";

import { useState } from "react";
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState, Input, Textarea } from "../../components";

type Ticket = { id: string; subject: string; status: "open" | "in_progress" | "resolved"; createdAt: string; lastReply: string };

export default function TicketsPage() {
  var [tickets] = useState<Ticket[]>([]);
  var [showCreate, setShowCreate] = useState(false);
  var [form, setForm] = useState({ subject: "", message: "" });

  var statusBadge = function(s: string) {
    if (s === "open") return <Badge variant="warning">Open</Badge>;
    if (s === "in_progress") return <Badge variant="info">In Progress</Badge>;
    return <Badge variant="success">Resolved</Badge>;
  };

  return (
    <PageContainer>
      <PageHeader title="Support Tickets" description="Get help from our support team"
        action={<Button variant="primary" size="sm" onClick={function() { setShowCreate(!showCreate); }}><Plus size={13} /> New Ticket</Button>} />

      {showCreate && (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Subject" value={form.subject} onChange={function(v) { setForm(Object.assign({}, form, { subject: v })); }} placeholder="Subject" />
            <Textarea label="Message" value={form.message} onChange={function(v) { setForm(Object.assign({}, form, { message: v })); }} placeholder="Describe your issue..." />
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="primary" size="sm">Submit Ticket</Button>
              <Button variant="ghost" size="sm" onClick={function() { setShowCreate(false); }}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        {tickets.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No support tickets" description="Create a ticket to get help from our team" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tickets.map(function(t) {
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {statusBadge(t.status)}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", margin: 0 }}>{t.subject}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{t.lastReply}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
