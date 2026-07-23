"use client";

import { useState, useEffect, useRef } from "react";
import { Users, UserPlus } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState, Skeleton, Input, Select, useToast, Toast } from "../../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

export default function WorkspaceMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const { toast, show, hide } = useToast();
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/workspaces/1/members", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sendInvite = () => {
    if (!inviteEmail) return;
    fetch(API + "/api/workspaces/1/invitations", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    }).then((r) => {
      if (r.ok) {
        show("Invitation sent to " + inviteEmail);
        setShowInvite(false);
        setInviteEmail("");
      } else {
        show("Failed to send invitation", "error");
      }
    }).catch(() => show("Failed to send invitation", "error"));
  };

  if (loading) {
    return <PageContainer><Skeleton count={3} height={60} /></PageContainer>;
  }

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <PageHeader title="Members" description="Manage people in your workspace" />

      <Card
        title={"All Members (" + members.length + ")"}
        action={
          <Button onClick={() => setShowInvite(!showInvite)} size="sm">
            <UserPlus size={13} /> Invite
          </Button>
        }
      >
        {members.length === 0 ? (
          <EmptyState icon={Users} title="No members yet" description="Start by inviting your first member" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {members.map((member) => (
              <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, borderRadius: 10 }}>
                  {member.name?.[0]?.toUpperCase() || member.email[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{member.name || "-"}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{member.email}</p>
                </div>
                <Badge variant={member.role === "owner" ? "danger" : member.role === "admin" ? "default" : "success"}>
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {showInvite && (
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Invite New Member</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="Email address" value={inviteEmail} onChange={setInviteEmail} placeholder="colleague@company.com" />
              <Select label="Role" value={inviteRole} onChange={setInviteRole} options={[{ label: "Member", value: "member" }, { label: "Admin", value: "admin" }]} />
              <div style={{ display: "flex", gap: 8 }}>
                <Button onClick={sendInvite} size="sm">Send Invite</Button>
                <Button onClick={() => setShowInvite(false)} variant="ghost" size="sm">Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
