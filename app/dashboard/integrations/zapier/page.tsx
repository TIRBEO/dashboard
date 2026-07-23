"use client";

import { Zap } from "lucide-react";
import { PageContainer, PageHeader, Card, Button } from "../../components";

export default function ZapierIntegrationPage() {
  return (
    <PageContainer>
      <PageHeader title="Zapier Integration" description="Automate workflows with 5,000+ app integrations" />

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,74,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={24} style={{ color: "#FF4A00" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Zapier</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Not connected</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          Connect Tirbeo to thousands of apps through Zapier. Automate repetitive tasks without code.
        </p>
        <Button variant="primary" size="sm"><Zap size={13} /> Connect Zapier</Button>
      </Card>

      <Card title="Popular Zaps">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "New workspace member → Send Slack message",
            "File uploaded → Create Google Drive copy",
            "Activity event → Log to Google Sheets",
          ].map(function(item, i) {
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#FF4A00", fontSize: 11, fontWeight: 600 }}>Zap</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{item}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </PageContainer>
  );
}
