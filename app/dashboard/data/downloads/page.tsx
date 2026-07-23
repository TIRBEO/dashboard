"use client";

import { useState, useEffect, useRef } from "react";
import { Archive, Download, Trash2 } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  EmptyState,
  Skeleton,
  Button,
} from "../../components";

type DownloadEntry = {
  id: string;
  filename: string;
  size: string;
  format: string;
  status: "ready" | "processing" | "expired";
  createdAt: string;
  expiresAt: string;
};

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    setLoading(false);
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Downloads"
        description="Your exported data and generated files"
      />

      <Card>
        {loading ? (
          <Skeleton count={3} height={56} />
        ) : downloads.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="No downloads yet"
            description="Export data from the Data section to see files here"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {downloads.map((d) => (
              <div
                key={d.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Archive size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{d.filename}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {d.size} &middot; {d.format} &middot; {d.createdAt}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {d.status === "ready" && (
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
                    onClick={() => setDownloads((p) => p.filter((x) => x.id !== d.id))}
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
