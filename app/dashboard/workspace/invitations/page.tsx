"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { UserPlus, Mail, Calendar, Clock, User, X, Check, Trash2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Invitation = {
  id: string;
  email: string;
  role: string;
  invitedBy: { name: string; email: string };
  invitedAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
};

export default function WorkspaceInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: "", role: "member" });
  const [toast, setToast] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/workspaces/1/invitations`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setInvitations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const create = useCallback(async () => {
    if (!form.email) return;
    try {
      const res = await fetch(`${API}/api/workspaces/1/invitations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newInv = await res.json();
        setInvitations((prev) => [newInv, ...prev]);
        setShowCreate(false);
        setForm({ email: "", role: "member" });
        setToast("Invitation sent");
        setTimeout(() => setToast(null), 3000);
      } else {
        const text = await res.text();
        setToast(`Failed: ${text}`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast("Connection error");
      setTimeout(() => setToast(null), 3000);
    }
  }, [form]);

  const cancel = useCallback(async (id: string) => {
    if (!confirm("Cancel this invitation?")) return;
    try {
      const res = await fetch(`${API}/api/workspaces/1/invitations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== id));
        setToast("Invitation cancelled");
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast("Failed to cancel");
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast("Connection error");
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-#162018";
      case "accepted": return "bg-#162018";
      case "expired": return "bg-#3d2a2a";
      case "cancelled": return "bg-#2a2a2a";
      default: return "bg-surface-elevated";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pending"; // Blue
      case "accepted": return "Accepted"; // Green
      case "expired": return "Expired"; // Red
      case "cancelled": return "Cancelled"; // Gray
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass card-section animate-in">
          <div className="skeleton" style={{ height: 40 }} />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass card-section animate-in">
            <div className="skeleton" style={{ height: 60 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="toast toast-success" style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}>{toast}</div>
      )}

      <div className="section-header">
        <h1>Invitations</h1>
        <p>Send invites to add people to your workspace</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Pending Invitations</h3>
            <p style={{ fontSize: 13, color: "#7b7e84", margin: "4px 0 0" }}>{invitations.filter((i) => i.status === "pending").length} awaiting response</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
            <UserPlus size={13} /> Send Invite
          </button>
        </div>

        {invitations.length === 0 ? (
          <div className="text-center py-8">
            <Mail size={40} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No invitations sent</p>
            <p style={{ fontSize: 13, color: "var(--text-ash)", marginTop: 4 }}>Start by inviting your first member</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded bg-surface-elevated"
                style={{ borderLeft: inv.status === "pending" ? "4px solid #d8b36a" : "4px solid #7b7e84" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, borderRadius: 10, background: "var(--accent)", color: "#0b0b0d", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {inv.email[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{inv.email}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <span className="badge badge-default" style={{ fontSize: 10 }}>{inv.role}</span>
                        <span style={{ fontSize: 11, color: "#7b7e84" }}>
                          <Mail size={10} style={{ display: "inline", marginRight: 4 }} /> Invited by {inv.invitedBy.name}
                        </span>
                        <span style={{ fontSize: 11, color: "#7b7e84" }}>
                          <Clock size={10} style={{ display: "inline", marginRight: 4 }} /> {new Date(inv.invitedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getStatusColor(inv.status)}`} style={{ fontSize: 11, padding: "4px 8px" }}>{getStatusLabel(inv.status)}</span>
                    {inv.status === "pending" && (
                      <button
                        onClick={() => cancel(inv.id)}
                        className="btn btn-danger"
                        style={{ height: 30, padding: "0 8px" }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreate && (
          <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: "0 0 12px" }}>Send Invitation</h3>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input-field"
              />
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="input-field"
                style={{ height: 40 }}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={create} className="btn btn-primary">Send Invitation</button>
                <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
