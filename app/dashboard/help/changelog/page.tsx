"use client";

import { Tag, CheckCircle, Bug, Zap } from "lucide-react";
import { PageContainer, PageHeader, Card, Badge } from "../../components";

var ENTRIES = [
  { version: "1.4.0", date: "July 2026", changes: [
    { type: "feature", text: "Developer section with API keys and webhooks" },
    { type: "feature", text: "Data export and backup system" },
    { type: "improvement", text: "Redesigned sidebar navigation" },
  ]},
  { version: "1.3.0", date: "June 2026", changes: [
    { type: "feature", text: "Workspace branding and customization" },
    { type: "feature", text: "Quiet hours for notifications" },
    { type: "fix", text: "Fixed session refresh on tab focus" },
  ]},
  { version: "1.2.0", date: "May 2026", changes: [
    { type: "feature", text: "Role-based access control" },
    { type: "feature", text: "2FA with TOTP and backup codes" },
    { type: "improvement", text: "Faster dashboard load times" },
  ]},
  { version: "1.1.0", date: "April 2026", changes: [
    { type: "feature", text: "Workspace member invitations" },
    { type: "fix", text: "Fixed OAuth callback URL" },
  ]},
  { version: "1.0.0", date: "March 2026", changes: [
    { type: "feature", text: "Initial launch of Tirbeo Dashboard" },
    { type: "feature", text: "Profile and account management" },
    { type: "feature", text: "Workspace creation and settings" },
  ]},
];

var typeIcon = function(t: string) {
  if (t === "feature") return <Zap size={10} style={{ color: "var(--success)" }} />;
  if (t === "fix") return <Bug size={10} style={{ color: "var(--gold)" }} />;
  return <CheckCircle size={10} style={{ color: "var(--info, #4f7aff)" }} />;
};

var typeBadge = function(t: string) {
  if (t === "feature") return <Badge variant="success">Feature</Badge>;
  if (t === "fix") return <Badge variant="warning">Fix</Badge>;
  return <Badge variant="info">Improvement</Badge>;
};

export default function ChangelogPage() {
  return (
    <PageContainer>
      <PageHeader title="Changelog" description="What's new in Tirbeo Dashboard" />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {ENTRIES.map(function(entry) {
          return (
            <Card key={entry.version}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <Tag size={14} style={{ color: "var(--gold)" }} />
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>v{entry.version}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>{entry.date}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {entry.changes.map(function(c, i) {
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {typeIcon(c.type)}
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{c.text}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
