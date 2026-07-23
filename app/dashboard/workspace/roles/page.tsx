"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Shield, Crown, UserMinus, Settings, Plus, Trash2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Role = {
  id: string;
  name: string;
  level: number;
  permissions: string[];
  isSystem: boolean;
};

export default function WorkspaceRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/workspaces/1/roles`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setRoles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass card-section animate-in">
            <div className="skeleton" style={{ height: 60 }} />
          </div>
        ))}
      </div>
    );
  }

  const systemRoles = roles.filter((r) => r.isSystem);
  const customRoles = roles.filter((r) => !r.isSystem);

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h1>Roles</h1>
        <p>Manage roles and permissions in your workspace</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>System Roles</h3>
            <p style={{ fontSize: 13, color: "#7b7e84", margin: "4px 0 0" }}>{systemRoles.length} built-in roles</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
            <Plus size={13} /> New Role
          </button>
        </div>

        <div className="space-y-3">
          {systemRoles.map((role) => (
            <div
              key={role.id}
              className="p-4 rounded bg-surface-elevated"
              style={{ borderLeft: `4px solid ${role.level === 3 ? "#ff6161" : role.level === 2 ? "#d8b36a" : "#59d499"}` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ padding: "6px 10px", borderRadius: 8, background: `${role.level === 3 ? "#3d2a2a" : role.level === 2 ? "#322e13" : "#162018"}` }}>
                    <Crown size={14} style={{ color: role.level === 3 ? "#ff6161" : role.level === 2 ? "#d8b36a" : "#59d499" }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{role.name}</p>
                      <span className="badge badge-danger">System</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#7b7e84", marginTop: 2 }}>{role.permissions.length} permissions</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#7b7e84", marginBottom: 4 }}>{role.level === 3 ? "Full access" : role.level === 2 ? "Moderate access" : "Basic access"}</div>
                  <span className="badge" style={{ background: `${role.level === 3 ? "#3d2a2a" : role.level === 2 ? "#322e13" : "#162018"}`, color: `${role.level === 3 ? "#ff6161" : role.level === 2 ? "#d8b36a" : "#59d499"}` }}>{role.level}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {customRoles.length > 0 && (
        <div className="glass card-section">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: "0 0 16px" }}>Custom Roles</h3>
          <div className="space-y-3">
            {customRoles.map((role) => (
              <div key={role.id} className="p-3 rounded bg-surface-elevated" style={{ borderLeft: `3px solid #7b7e84` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{role.name}</p>
                    <p style={{ fontSize: 12, color: "#7b7e84", marginTop: 1 }}>{role.permissions.length} permissions</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost" style={{ height: 28, padding: "0 8px" }}>
                      <Settings size={12} />
                    </button>
                    <button className="btn btn-danger" style={{ height: 28, padding: "0 8px" }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreate && (
        <div className="glass card-section animate-in">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: "0 0 12px" }}>Create New Role</h3>
          <div className="space-y-3">
            <input placeholder="Role name" className="input-field" />
            <textarea placeholder="Description (optional)" className="input-field" style={{ minHeight: 80 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary">Create</button>
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
