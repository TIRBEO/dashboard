"use client";

import { useState } from "react";
import { Code } from "lucide-react";
import { PageContainer, PageHeader, Card, SettingRow, Toggle, CodeBlock } from "../../components";

var SESSION_DATA = {
  userId: "usr_...",
  sessionId: "ses_...",
  expiresAt: "2026-08-23T00:00:00Z",
  role: null,
  features: { devMode: true },
};

export default function DeveloperModePage() {
  var [enabled, setEnabled] = useState(false);
  var [showRaw, setShowRaw] = useState(false);

  return (
    <PageContainer>
      <PageHeader title="Developer Mode" description="Debug tools and raw data inspection" />

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SettingRow label="Enable Developer Mode" description="Shows debug info, raw JSON, and API details" border={false}>
            <Toggle checked={enabled} onChange={function() { setEnabled(!enabled); }} />
          </SettingRow>

          {enabled && (
            <>
              <SettingRow label="Show Raw Data" description="Display raw JSON on settings pages" border={false}>
                <Toggle checked={showRaw} onChange={function() { setShowRaw(!showRaw); }} />
              </SettingRow>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Code size={12} style={{ color: "var(--gold)" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Session Info</span>
                </div>
                <CodeBlock code={JSON.stringify(SESSION_DATA, null, 2)} language="json" />
              </div>
            </>
          )}
        </div>
      </Card>
    </PageContainer>
  );
}
