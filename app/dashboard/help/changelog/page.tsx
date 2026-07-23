"use client";

import { ListOrdered, Tag, CheckCircle, Bug, Zap } from "lucide-react";

const ENTRIES = [
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

const typeIcon = (t: string) => {
  if (t === "feature") return <Zap size={10} className="text-[#59d499]" />;
  if (t === "fix") return <Bug size={10} className="text-[#d8b36a]" />;
  return <CheckCircle size={10} className="text-[#4f7aff]" />;
};

export default function ChangelogPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Changelog</h1>
        <p className="text-sm text-muted-foreground">What's new in Tirbeo Dashboard</p>
      </div>

      <div className="space-y-6">
        {ENTRIES.map((entry) => (
          <div key={entry.version} className="glass card-section">
            <div className="flex items-center gap-3 mb-3">
              <Tag size={14} className="text-[#d8b36a]" />
              <div>
                <span className="text-sm font-semibold text-white">v{entry.version}</span>
                <span className="text-xs text-muted-foreground ml-2">{entry.date}</span>
              </div>
            </div>
            <div className="space-y-2">
              {entry.changes.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  {typeIcon(c.type)}
                  <span className="text-xs text-muted-foreground">{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
