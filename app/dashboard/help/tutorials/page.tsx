"use client";

import { Clock, Play } from "lucide-react";
import { PageContainer, PageHeader, Card } from "../../components";

const TUTORIALS = [
  { title: "Setting Up Your First Workspace", duration: "5 min", level: "Beginner", icon: "1" },
  { title: "Managing Team Members", duration: "8 min", level: "Beginner", icon: "2" },
  { title: "Configuring SSO Authentication", duration: "12 min", level: "Intermediate", icon: "3" },
  { title: "Building with the Tirbeo API", duration: "15 min", level: "Advanced", icon: "4" },
  { title: "Setting Up Webhooks", duration: "10 min", level: "Intermediate", icon: "5" },
  { title: "Customizing Your Dashboard", duration: "6 min", level: "Beginner", icon: "6" },
];

export default function TutorialsPage() {
  return (
    <PageContainer>
      <PageHeader title="Tutorials" description="Step-by-step guides to get the most out of Tirbeo" />

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TUTORIALS.map(function(t, i) {
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 10, cursor: "pointer", transition: "background 0.15s" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(216,179,106,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {t.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", margin: 0 }}>{t.title}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 3 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={10} /> {t.duration}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.level}</span>
                  </div>
                </div>
                <Play size={14} style={{ color: "var(--gold)" }} />
              </div>
            );
          })}
        </div>
      </Card>
    </PageContainer>
  );
}
