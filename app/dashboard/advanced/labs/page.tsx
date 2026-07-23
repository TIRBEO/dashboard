"use client";

import { FlaskConical } from "lucide-react";
import { useState } from "react";
import { PageContainer, PageHeader, Card, SettingRow, Toggle, Badge } from "../../components";

var LABS = [
  { id: "ai-search", name: "AI-Powered Search", desc: "Semantic search across your workspace using natural language", enabled: false },
  { id: "realtime-collab", name: "Real-time Collaboration", desc: "Edit documents simultaneously with team members", enabled: false },
  { id: "auto-tags", name: "Auto-Tagging", desc: "AI automatically categorizes your files and messages", enabled: false },
  { id: "smart-notif", name: "Smart Notifications", desc: "AI-prioritized notifications based on importance", enabled: false },
];

export default function LabsPage() {
  var [features, setFeatures] = useState(LABS);

  var toggle = function(id: string) {
    setFeatures(function(f) { return f.map(function(x) { return x.id === id ? Object.assign({}, x, { enabled: !x.enabled }) : x; }); });
  };

  return (
    <PageContainer>
      <PageHeader title="Labs" description="Experimental features still in development"
        action={<Badge variant="gold">Beta</Badge>} />

      <Card>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
          These features may be unstable, change, or be removed at any time. Enable at your own risk.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {features.map(function(f) {
            return (
              <SettingRow key={f.id} label={f.name} description={f.desc}>
                <Toggle checked={f.enabled} onChange={function() { toggle(f.id); }} />
              </SettingRow>
            );
          })}
        </div>
      </Card>
    </PageContainer>
  );
}
