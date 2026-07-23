"use client";

import { useState } from "react";
import { Download, FileJson, FileText, FileSpreadsheet, CheckCircle } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Toast,
  useToast,
} from "../../components";

const FORMATS = [
  { id: "json", label: "JSON", desc: "Machine-readable, complete data" },
  { id: "csv", label: "CSV", desc: "Spreadsheet compatible" },
  { id: "markdown", label: "Markdown", desc: "Human-readable format" },
];

const DATA_TYPES = [
  { id: "profile", label: "Profile Data", desc: "Name, bio, avatar, preferences" },
  { id: "workspaces", label: "Workspaces", desc: "All workspace data and settings" },
  { id: "activity", label: "Activity Logs", desc: "Login history and actions" },
  { id: "files", label: "Files & Uploads", desc: "All uploaded files" },
  { id: "messages", label: "Messages", desc: "Direct messages and conversations" },
  { id: "notifications", label: "Notifications", desc: "Notification history" },
];

const FORMAT_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  json: FileJson,
  csv: FileSpreadsheet,
  markdown: FileText,
};

export default function DataExportPage() {
  const [format, setFormat] = useState("json");
  const [selected, setSelected] = useState(["profile", "workspaces", "activity"]);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const { toast, show, hide } = useToast();

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const exportData = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setDone(true);
      show("Export completed successfully");
      setTimeout(() => setDone(false), 3000);
    }, 2000);
  };

  return (
    <PageContainer className="max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <PageHeader
        title="Export Data"
        description="Download a copy of your Tirbeo data"
      />

      <Card title="Format">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {FORMATS.map((f) => {
            const Icon = FORMAT_ICONS[f.id];
            const active = format === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  border: "1px solid " + (active ? "var(--accent)" : "var(--border)"),
                  background: active ? "rgba(216,179,106,0.08)" : "var(--bg-surface-elevated)",
                  color: "inherit",
                  fontFamily: "inherit",
                }}
              >
                <Icon
                  size={24}
                  style={{
                    display: "block",
                    margin: "0 auto 8px",
                    color: active ? "var(--accent)" : "var(--text-ash)",
                  }}
                />
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{f.label}</p>
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{f.desc}</p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Data to Export">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DATA_TYPES.map((dt) => {
            const checked = selected.includes(dt.id);
            return (
              <label
                key={dt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 10,
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(dt.id)}
                  style={{ accentColor: "var(--accent)", width: 16, height: 16, flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{dt.label}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{dt.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="gold"
          onClick={exportData}
          disabled={exporting || selected.length === 0}
        >
          {done ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <CheckCircle size={14} /> Export Ready
            </span>
          ) : exporting ? (
            "Exporting..."
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Download size={14} /> Export Data
            </span>
          )}
        </Button>
      </div>
    </PageContainer>
  );
}
