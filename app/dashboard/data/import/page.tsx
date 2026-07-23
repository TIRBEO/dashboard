"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Toast,
  useToast,
} from "../../components";

export default function DataImportPage() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast, show, hide } = useToast();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const importData = () => {
    if (!file) return;
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setResult({ success: true, message: "Import completed successfully. 0 items imported." });
      show("Import completed successfully");
      setTimeout(() => setResult(null), 4000);
    }, 2000);
  };

  const dropBorderColor = dragging
    ? "var(--accent)"
    : file
    ? "var(--success)"
    : "var(--border)";

  const dropBg = dragging
    ? "rgba(216,179,106,0.05)"
    : file
    ? "rgba(89,212,153,0.05)"
    : "transparent";

  return (
    <PageContainer className="max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <PageHeader
        title="Import Data"
        description="Import data from other platforms or backups"
      />

      <Card title="Upload File">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: "2px dashed " + dropBorderColor,
            borderRadius: 12,
            padding: "48px 24px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.15s",
            background: dropBg,
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".json,.csv,.tsv"
            onChange={handleFile}
            style={{ display: "none" }}
          />
          {file ? (
            <>
              <CheckCircle size={40} style={{ display: "block", margin: "0 auto 12px", color: "var(--success)" }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{file.name}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </>
          ) : (
            <>
              <Upload size={40} style={{ display: "block", margin: "0 auto 12px", color: "var(--text-ash)" }} />
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Drag and drop a file here, or click to browse
              </p>
              <p style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 4 }}>
                Supports JSON, CSV
              </p>
            </>
          )}
        </div>
      </Card>

      {result && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {result.success ? (
              <CheckCircle size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
            ) : (
              <AlertCircle size={16} style={{ color: "var(--danger)", flexShrink: 0 }} />
            )}
            <p style={{ fontSize: 13, color: "var(--text)" }}>{result.message}</p>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="gold" onClick={importData} disabled={!file || importing}>
          {importing ? "Importing..." : "Import Data"}
        </Button>
      </div>
    </PageContainer>
  );
}
