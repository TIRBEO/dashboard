"use client";

import { useState } from "react";
import { Database, Plus, Download, Trash2, CheckCircle, Clock } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Badge,
  EmptyState,
} from "../../components";

type Backup = {
  id: string;
  name: string;
  size: string;
  status: "complete" | "in_progress" | "failed";
  createdAt: string;
  includes: string[];
};

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);

  const createBackup = () => {
    const b: Backup = {
      id: Date.now().toString(),
      name: "Manual Backup " + new Date().toLocaleDateString(),
      size: "Calculating...",
      status: "in_progress",
      createdAt: new Date().toISOString(),
      includes: ["profile", "workspaces", "files"],
    };
    setBackups((prev) => [b, ...prev]);
    setTimeout(() => {
      setBackups((prev) =>
        prev.map((x) =>
          x.id === b.id ? { ...x, size: "12.4 MB", status: "complete" as const } : x
        )
      );
    }, 3000);
  };

  const getStatusBadge = (status: Backup["status"]) => {
    switch (status) {
      case "complete": return <Badge variant="success">Complete</Badge>;
      case "in_progress": return <Badge variant="warning">In Progress</Badge>;
      case "failed": return <Badge variant="danger">Failed</Badge>;
    }
  };

  const getStatusIcon = (status: Backup["status"]) => {
    switch (status) {
      case "complete": return <CheckCircle size={14} style={{ color: "var(--success)" }} />;
      case "in_progress": return <Clock size={14} style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />;
      case "failed": return <Database size={14} style={{ color: "var(--danger)" }} />;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Backups"
        description="Create and manage account backups"
        action={
          <Button variant="gold" onClick={createBackup}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Plus size={13} /> Create Backup
            </span>
          </Button>
        }
      />

      <Card>
        {backups.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No backups created"
            description="Create your first backup to protect your data"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {backups.map((b) => (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {getStatusIcon(b.status)}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{b.name}</p>
                      {getStatusBadge(b.status)}
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {b.size} &middot; {b.includes.join(", ")}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {b.status === "complete" && (
                    <button
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        background: "rgba(255,255,255,0.05)",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      <Download size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => setBackups((p) => p.filter((x) => x.id !== b.id))}
                    style={{
                      padding: 6,
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.05)",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
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
