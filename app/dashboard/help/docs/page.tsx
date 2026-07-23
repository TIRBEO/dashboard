"use client";

import { useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { PageContainer, PageHeader, Card, Badge, EmptyState, Input } from "../../components";

const DOCS = [
  { title: "Getting Started", category: "Basics", desc: "Set up your account and workspace" },
  { title: "Workspaces", category: "Basics", desc: "Create, manage, and collaborate" },
  { title: "Authentication & SSO", category: "Security", desc: "Login, 2FA, and SSO configuration" },
  { title: "API Reference", category: "Developer", desc: "REST API endpoints and authentication" },
  { title: "Webhooks", category: "Developer", desc: "Real-time event notifications" },
  { title: "SDKs & Libraries", category: "Developer", desc: "Client libraries for JS, Python, Go, and more" },
  { title: "Role-Based Access", category: "Security", desc: "Permissions and role management" },
  { title: "Billing & Plans", category: "Account", desc: "Subscription tiers and usage" },
];

export default function DocsPage() {
  var [search, setSearch] = useState("");
  var filtered = search
    ? DOCS.filter(function(d) { return d.title.toLowerCase().includes(search.toLowerCase()) || d.desc.toLowerCase().includes(search.toLowerCase()); })
    : DOCS;

  return (
    <PageContainer>
      <PageHeader title="Documentation" description="Guides and API reference" />

      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-ash)", pointerEvents: "none" }} />
        <Input value={search} onChange={setSearch} placeholder="Search docs..." />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={BookOpen} title="No docs found" description="Try a different search term" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filtered.map(function(doc, i) {
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, cursor: "pointer", transition: "background 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <BookOpen size={14} style={{ color: "var(--gold)" }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", margin: 0 }}>{doc.title}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{doc.desc}</p>
                    </div>
                  </div>
                  <Badge>{doc.category}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
