"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { UserPlus, Mail, Clock, Trash2 } from "lucide-react";

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
  const [toast, setToast] = useState("");
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    const url = API + "/api/workspaces/1/invitations";
    fetch(url, { credentials: "include" })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) { setInvitations(Array.isArray(data) ? data : []); })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }, []);

  var create = useCallback(function () {
    if (!email) return;
    var url = API + "/api/workspaces/1/invitations";
    fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, role: role }),
    }).then(function (res) {
      if (res.ok) {
        return res.json();
      }
      throw new Error("Failed");
    }).then(function (newInv) {
      setInvitations(function (prev) { return [newInv].concat(prev); });
      setShowCreate(false);
      setEmail("");
      setToast("Invitation sent");
      setTimeout(function () { setToast(""); }, 3000);
    }).catch(function () {
      setToast("Failed to send invitation");
      setTimeout(function () { setToast(""); }, 3000);
    });
  }, [email, role]);

  var cancelInvite = useCallback(function (id: string) {
    if (!confirm("Cancel this invitation?")) return;
    var url = API + "/api/workspaces/1/invitations/" + id;
    fetch(url, { method: "DELETE", credentials: "include" }).then(function (res) {
      if (res.ok) {
        setInvitations(function (prev) { return prev.filter(function (i) { return i.id !== id; }); });
        setToast("Invitation cancelled");
        setTimeout(function () { setToast(""); }, 3000);
      }
    }).catch(function () {});
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(function (i) {
          return (
            <div key={i} className="glass card-section animate-pulse" style={{ height: 80 }} />
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2 rounded-lg bg-[#59d499] text-black text-sm font-medium">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Invitations</h1>
        <p className="text-sm text-muted-foreground">Manage workspace invitations</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Pending Invitations ({invitations.length})</h3>
          <button onClick={function () { setShowCreate(!showCreate); }} className="btn btn-primary text-xs">
            <UserPlus size={13} /> Invite
          </button>
        </div>

        {showCreate && (
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 mb-4 space-y-3">
            <input placeholder="Email address" value={email} onChange={function (e) { setEmail(e.target.value); }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            <select value={role} onChange={function (e) { setRole(e.target.value); }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2">
              <button onClick={create} className="btn btn-primary text-xs">Send Invitation</button>
              <button onClick={function () { setShowCreate(false); }} className="btn btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        )}

        {invitations.length === 0 ? (
          <div className="text-center py-12">
            <Mail size={48} style={{ color: "#7b7e84", margin: "0 auto 12px" }} />
            <p className="text-sm text-muted-foreground">No pending invitations</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invitations.map(function (inv) {
              return (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-[#d8b36a]" />
                    <div>
                      <p className="text-sm font-medium text-white">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">{inv.role} · Sent {new Date(inv.invitedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-muted-foreground">{inv.status}</span>
                    <button onClick={function () { cancelInvite(inv.id); }}
                      className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
