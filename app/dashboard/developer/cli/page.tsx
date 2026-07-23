"use client";

import { useState } from "react";
import { Terminal, Copy, CheckCircle2, ExternalLink, Package, Apple, Monitor } from "lucide-react";
import { PageContainer, PageHeader, Card, Button } from "../../components";

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
      <PageHeader title="CLI" description="Install and configure the Tirbeo command-line tool" />

      <Card title="Installation">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            The Tirbeo CLI lets you manage your account, API keys, and preferences directly from the terminal.
          </p>

          <CodeBlock label="Install via npm">npm install -g @tirbeo/cli</CodeBlock>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, background: "var(--accent-muted)", fontSize: 12, color: "var(--text-muted)" }}>
              <Package size={12} /> npm
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, background: "var(--accent-muted)", fontSize: 12, color: "var(--text-muted)" }}>
              <Terminal size={12} /> pnpm
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, background: "var(--accent-muted)", fontSize: 12, color: "var(--text-muted)" }}>
              <Apple size={12} /> Homebrew
            </div>
          </div>
        </div>
      </Card>

      <Card title="Authentication">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Log in with your Tirbeo account. This opens a browser for secure authentication.
          </p>
          <CodeBlock label="Login">tirbeo login</CodeBlock>

          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Or set your API key directly:
          </p>
          <CodeBlock label="Set API Key">tirbeo auth --key YOUR_API_KEY</CodeBlock>
        </div>
      </Card>

      <Card title="Commands">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { cmd: "tirbeo whoami", desc: "Show current user info" },
            { cmd: "tirbeo profile get", desc: "Get your profile data" },
            { cmd: "tirbeo profile update --name \"New Name\"", desc: "Update profile fields" },
            { cmd: "tirbeo keys list", desc: "List all API keys" },
            { cmd: "tirbeo keys create --name \"my-app\"", desc: "Create a new API key" },
            { cmd: "tirbeo keys revoke KEY_ID", desc: "Revoke an API key" },
            { cmd: "tirbeo prefs get", desc: "Show current preferences" },
            { cmd: "tirbeo prefs set --theme dark", desc: "Update a preference" },
            { cmd: "tirbeo sessions list", desc: "List active sessions" },
            { cmd: "tirbeo sessions revoke SESSION_ID", desc: "Revoke a session" },
            { cmd: "tirbeo notifications list", desc: "List recent notifications" },
            { cmd: "tirbeo security status", desc: "Show security status" },
            { cmd: "tirbeo export --format json", desc: "Export your data" },
          ].map(item => (
            <div key={item.cmd} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border)",
            }}>
              <code style={{ fontSize: 12, color: "var(--gold)", fontFamily: "monospace", flexShrink: 0 }}>{item.cmd}</code>
              <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Configuration">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            The CLI stores config in <code style={{ padding: "2px 6px", borderRadius: 4, background: "var(--bg-elevated)", fontSize: 12, color: "var(--gold)" }}>~/.tirbeo/config.json</code>. You can also set environment variables:
          </p>
          <CodeBlock label="Environment Variables" code={"TIRBEO_API_KEY=your_key_here\nTIRBEO_API_URL=" + API} />
        </div>
      </Card>
    </PageContainer>
  );
}
