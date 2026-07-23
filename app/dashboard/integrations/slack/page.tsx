"use client";

import { Hash } from "lucide-react";
import { PageContainer, PageHeader, Card, Button } from "../../components";

export default function SlackIntegrationPage() {
  return (
    <PageContainer>
      <PageHeader title="Slack Integration" description="Connect Slack for team notifications and alerts" />

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(74,21,75,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hash size={24} style={{ color: "#E01E5A" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Slack</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Not connected</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          Post workspace activity and alerts directly to your Slack channels.
        </p>
        <Button variant="primary" size="sm"><Hash size={13} /> Add to Slack</Button>
      </Card>

      <Card title="Features">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Post notifications to specific channels",
            "Receive DM alerts for mentions",
            "Slash commands for quick actions",
          ].map(function(item, i) {
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--success)", fontSize: 13 }}>+</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{item}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </PageContainer>
  );
}
