"use client";

import { Terminal, ExternalLink } from "lucide-react";
import { useState } from "react";
import { PageContainer, PageHeader, Card, CodeBlock } from "../../components";

const COMMANDS = [
  { cmd: "npx @tirbeo/cli login", desc: "Authenticate with your Tirbeo account" },
  { cmd: "npx @tirbeo/cli workspace list", desc: "List all your workspaces" },
  { cmd: "npx @tirbeo/cli workspace create --name <name>", desc: "Create a new workspace" },
  { cmd: "npx @tirbeo/cli member list --workspace <id>", desc: "List workspace members" },
  { cmd: "npx @tirbeo/cli member invite --email <email>", desc: "Invite a member by email" },
  { cmd: "npx @tirbeo/cli config set --key <key> --value <value>", desc: "Update workspace settings" },
  { cmd: "npx @tirbeo/cli logs --workspace <id> --limit 50", desc: "View recent activity logs" },
];

export default function CliPage() {
  return (
    <PageContainer>
      <PageHeader title="CLI" description="Manage your workspace from the command line" />

      <Card title="Quick Install" subtitle="Check your CLI version">
        <CodeBlock code="$ npx @tirbeo/cli --version" language="bash" />
      </Card>

      <Card title="Available Commands">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {COMMANDS.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
              <div>
                <code style={{ fontSize: 12, fontFamily: "monospace", color: "var(--gold)" }}>{c.cmd}</code>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{c.desc}</p>
              </div>
              <CodeBlock code={c.cmd} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Documentation" subtitle="Read the full CLI documentation for advanced usage and configuration.">
        <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--gold)", textDecoration: "none" }}>
          View Docs <ExternalLink size={11} />
        </a>
      </Card>
    </PageContainer>
  );
}
