"use client";

import { MessageCircle } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge } from "../../components";

export default function DiscordIntegrationPage() {
  return (
    <PageContainer>
      <PageHeader title="Discord Integration" description="Connect your Discord account for notifications and authentication" />

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(88,101,242,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageCircle size={24} style={{ color: "#5865F2" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Discord</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Not connected</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          Connect Discord to receive workspace notifications in your Discord channels and use Discord as a sign-in method.
        </p>
        <Button variant="primary" size="sm"><MessageCircle size={13} /> Connect Discord</Button>
      </Card>

      <Card title="What you can do">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Receive workspace notifications via webhook",
            "Sign in with your Discord account",
            "Sync Discord roles with workspace roles",
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
