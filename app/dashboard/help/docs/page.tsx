"use client";

import { BookOpen, ExternalLink, Search } from "lucide-react";
import { useState } from "react";

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
  const [search, setSearch] = useState("");
  const filtered = search ? DOCS.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()) || d.desc.toLowerCase().includes(search.toLowerCase())) : DOCS;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Documentation</h1>
        <p className="text-sm text-muted-foreground">Guides and API reference</p>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input placeholder="Search docs..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white" />
      </div>

      <div className="space-y-2">
        {filtered.map((doc, i) => (
          <div key={i} className="glass card-section flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3">
              <BookOpen size={14} className="text-[#d8b36a]" />
              <div>
                <p className="text-sm font-medium text-white">{doc.title}</p>
                <p className="text-xs text-muted-foreground">{doc.desc}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-muted-foreground">{doc.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
