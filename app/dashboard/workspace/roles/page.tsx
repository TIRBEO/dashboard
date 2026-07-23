"use client";

import { useState, useEffect, useRef } from "react";
import { Crown, Settings, Plus, Trash2 } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState, Skeleton, Input, Textarea, useToast, Toast } from "../../components";

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
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const { toast, show, hide } = useToast();
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/workspaces/1/roles", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setRoles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createRole = () => {
    if (!newName) return;
    fetch(API + "/api/workspaces/1/roles", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc }),
    }).then((r) => r.ok ? r.json() : null).then((role) => {
      if (role) {
        setRoles((prev) => prev.concat([role]));
        show("Role created");
      }
    }).catch(() => {});
    setShowCreate(false);
    setNewName("");
    setNewDesc("");
  };

  const deleteRole = (id: string) => {
    fetch(API + "/api/workspaces/1/roles/" + id, { method: "DELETE", credentials: "include" })
      .then((r) => {
        if (r.ok) {
          setRoles((prev) => prev.filter((r) => r.id !== id));
          show("Role deleted");
        }
      }).catch(() => {});
  };

  if (loading) return <PageContainer><Skeleton count={3} height={60} /></PageContainer>;

  var systemRoles = roles.filter((r) => r.isSystem);
  var customRoles = roles.filter((r) => !r.isSystem);

  var getRoleColor = (level: number) => level === 3 ? "var(--danger)" : level === 2 ? "var(--gold)" : "var(--success)";
  var getRoleBg = (level: number) => level === 3 ? "rgba(255,97,97,0.1)" : level === 2 ? "rgba(216,179,106,0.1)" : "rgba(89,212,153,0.1)";

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      <PageHeader title="Roles" description="Manage roles and permissions in your workspace" />

      <Card
        title={"System Roles (" + systemRoles.length + ")"}
        action={
          <Button onClick={() => setShowCreate(!showCreate)} size="sm">
            <Plus size={13} /> New Role
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {systemRoles.map((role) => (
            <div key={role.id} style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", borderLeft: "4px solid " + getRoleColor(role.level) }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ padding: "6px 10px", borderRadius: 8, background: getRoleBg(role.level) }}>
                    <Crown size={14} style={{ color: getRoleColor(role.level) }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{role.name}</p>
                      <Badge variant="danger">System</Badge>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{role.permissions.length} permissions</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{role.level === 3 ? "Full access" : role.level === 2 ? "Moderate access" : "Basic access"}</div>
                  <Badge style={{ background: getRoleBg(role.level), color: getRoleColor(role.level) }}>{role.level}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {customRoles.length > 0 && (
        <Card title={"Custom Roles (" + customRoles.length + ")"}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {customRoles.map((role) => (
              <div key={role.id} style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.03)", borderLeft: "3px solid var(--text-muted)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{role.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{role.permissions.length} permissions</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="ghost" size="sm"><Settings size={12} /></Button>
                    <Button variant="danger" size="sm" onClick={() => deleteRole(role.id)}><Trash2 size={12} /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showCreate && (
        <Card title="Create New Role">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Role name" value={newName} onChange={setNewName} placeholder="e.g., Content Editor" />
            <Textarea label="Description (optional)" value={newDesc} onChange={setNewDesc} placeholder="What this role can do..." />
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={createRole} size="sm">Create</Button>
              <Button onClick={() => setShowCreate(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
