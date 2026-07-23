"use client";

import { useState } from "react";
import { Terminal, Copy, CheckCircle2, Code } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge } from "../../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

function CodeBlock({ children, code, label }: { children?: string; code?: string; label?: string }) {
  const content = code || children || "";
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{ position: "relative" }}>
      {label && <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)", marginBottom: 6 }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 12, color: "var(--gold)", lineHeight: 1.6 }}>
        <code style={{ flex: 1, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{content}</code>
        <button onClick={copy} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-ash)", padding: 4, flexShrink: 0 }}>
          {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
}

export default function CliPage() {
  return (
    <PageContainer>
      <PageHeader title="API Reference" description="Use the Tirbeo API to build integrations and automate workflows" />

      <Card title="Base URL">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            All API requests use this base URL. Include your API key in the <code style={{ padding: "2px 6px", borderRadius: 4, background: "var(--bg-elevated)", fontSize: 12, color: "var(--gold)" }}>Authorization</code> header.
          </p>
          <CodeBlock label="Base URL">{API}</CodeBlock>
          <CodeBlock label="Authentication Header">{"Authorization: Bearer YOUR_API_KEY"}</CodeBlock>
        </div>
      </Card>

      <Card title="Quick Examples">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)", marginBottom: 8 }}>Get your profile</p>
            <CodeBlock code={`curl -s -H "Authorization: Bearer $TIRBEO_API_KEY" \\\n  ${API}/api/profile | jq .`} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)", marginBottom: 8 }}>Update your profile</p>
            <CodeBlock code={`curl -s -X PATCH -H "Authorization: Bearer $TIRBEO_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "New Name"}' \\\n  ${API}/api/profile`} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)", marginBottom: 8 }}>List notifications</p>
            <CodeBlock code={`curl -s -H "Authorization: Bearer $TIRBEO_API_KEY" \\\n  "${API}/api/notifications?limit=10" | jq .`} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)", marginBottom: 8 }}>List active sessions</p>
            <CodeBlock code={`curl -s -H "Authorization: Bearer $TIRBEO_API_KEY" \\\n  ${API}/api/security/sessions | jq .`} />
          </div>
        </div>
      </Card>

      <Card title="Available Endpoints">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { method: "GET", path: "/api/profile", desc: "Get your profile" },
            { method: "PATCH", path: "/api/profile", desc: "Update your profile" },
            { method: "GET", path: "/api/notifications", desc: "List notifications" },
            { method: "PATCH", path: "/api/notifications", desc: "Mark notifications read" },
            { method: "GET", path: "/api/security/sessions", desc: "List active sessions" },
            { method: "DELETE", path: "/api/security/sessions/revoke-all", desc: "Revoke all sessions" },
            { method: "GET", path: "/api/user/activity", desc: "Recent activity log" },
            { method: "GET", path: "/api/preferences", desc: "Get preferences" },
            { method: "PATCH", path: "/api/preferences", desc: "Update preferences" },
            { method: "GET", path: "/api/developer/api-keys", desc: "List API keys" },
            { method: "POST", path: "/api/developer/api-keys", desc: "Create API key" },
          ].map(ep => (
            <div key={ep.method + ep.path} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
              borderRadius: 6, fontSize: 12,
            }}>
              <Badge style={{ fontSize: 10, minWidth: 42, textAlign: "center" }}>{ep.method}</Badge>
              <code style={{ fontFamily: "monospace", color: "var(--gold)", flexShrink: 0 }}>{ep.path}</code>
              <span style={{ color: "var(--text-muted)", marginLeft: "auto" }}>{ep.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Setup">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Set your API key as an environment variable for easy access:
          </p>
          <CodeBlock label="Bash / Zsh" code={"export TIRBEO_API_KEY=your_api_key_here"} />
          <CodeBlock label="Windows PowerShell" code={"$env:TIRBEO_API_KEY=\"your_api_key_here\""} />
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Generate API keys from the <a href="/dashboard/developer/api-keys" style={{ color: "var(--accent)" }}>API Keys</a> page.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
