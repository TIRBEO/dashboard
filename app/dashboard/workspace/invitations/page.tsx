"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mail, Trash2 } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState, Skeleton, Input, Select, Toast } from "../../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Invitation = {
  id: string;
  email: string;
  role: string;
  invitedAt: string;
  expiresAt: string;
  status: string;
};

export default function WorkspaceInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/workspaces/1/invitations", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setInvitations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const create = useCallback(() => {
    if (!email) return;
    fetch(API + "/api/workspaces/1/invitations", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, role: role }),
    }).then((res) => {
      if (res.ok) return res.json();
      throw new Error("Failed");
    }).then((newInv) => {
      setInvitations((prev) => [newInv].concat(prev));
      setShowCreate(false);
      setEmail("");
      showToast("Invitation sent");
    }).catch(() => {
      showToast("Failed to send invitation", "error");
    });
  }, [email, role, showToast]);

  const cancelInvite = useCallback((id: string) => {
    if (!confirm("Cancel this invitation?")) return;
    fetch(API + "/api/workspaces/1/invitations/" + id, { method: "DELETE", credentials: "include" }).then((res) => {
      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== id));
        showToast("Invitation cancelled");
      }
    }).catch(() => {});
  }, [showToast]);

  if (loading) return <PageContainer><Skeleton count={3} height={80} /></PageContainer>;

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PageHeader title="Invitations" description="Manage workspace invitations" />

      <Card
        title={"Pending Invitations (" + invitations.length + ")"}
        action={
          <Button onClick={() => setShowCreate(!showCreate)} size="sm">
            <Mail size={13} /> Invite
          </Button>
        }
      >
        {showCreate && (
          <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Email address" value={email} onChange={setEmail} placeholder="colleague@company.com" />
            <Select label="Role" value={role} onChange={setRole} options={[{ label: "Member", value: "member" }, { label: "Admin", value: "admin" }]} />
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={create} size="sm">Send Invitation</Button>
              <Button onClick={() => setShowCreate(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </div>
        )}

        {invitations.length === 0 ? (
          <EmptyState icon={Mail} title="No pending invitations" description="Invite members to collaborate" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {invitations.map((inv) => (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Mail size={14} style={{ color: "var(--gold)" }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{inv.email}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{inv.role} · Sent {new Date(inv.invitedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge>{inv.status}</Badge>
                  <button onClick={() => cancelInvite(inv.id)} style={{ padding: 6, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
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
