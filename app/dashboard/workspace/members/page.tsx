"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Building2, Users, Shield, UserPlus, Activity, HardDrive, Palette } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

export default function WorkspaceMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/workspaces/1/members`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass card-section animate-in">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h1>Members</h1>
        <p>Manage people in your workspace</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>All Members</h3>
            <p style={{ fontSize: 13, color: "#7b7e84", margin: "4px 0 0" }}>{members.length} total</p>
          </div>
          <button onClick={() => setShowInvite(!showInvite)} className="btn btn-primary">
            <UserPlus size={13} /> Invite
          </button>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-8">
            <Users size={40} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No members yet</p>
            <p style={{ fontSize: 13, color: "var(--text-ash)", marginTop: 4 }}>Start by inviting your first member</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded bg-surface-elevated">
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, borderRadius: 10 }}>
                  {member.name?.[0]?.toUpperCase() || member.email[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{member.name || "-"}</p>
                  <p style={{ fontSize: 12, color: "#7b7e84", marginTop: 2 }}>{member.email}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`badge ${member.role === "owner" ? "badge-danger" : member.role === "admin" ? "badge-default" : "badge-success"}`}>{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showInvite && (
          <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: "0 0 8px" }}>Invite New Member</h3>
            <div className="space-y-3">
              <input placeholder="Email address" className="input-field" />
              <div style={{ display: "flex", gap: 8 }}>
                <select className="input-field" style={{ flex: 1 }}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="btn btn-primary">Send Invite</button>
                <button onClick={() => setShowInvite(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
