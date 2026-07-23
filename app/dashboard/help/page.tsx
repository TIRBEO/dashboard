"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HelpCircle, Shield, Bug, ExternalLink, ChevronDown, ChevronRight, Search, Mail, MessageSquare, Zap, Globe, Bell } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, FilterTabs, EmptyState, Skeleton, Input } from "../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type HelpArticle = { id: string; title: string; content: string; category: string; icon: string };
type HelpConfig = { articles: HelpArticle[]; contactEmail: string; faqEnabled: boolean };

const DEFAULT_ARTICLES: HelpArticle[] = [
  { id: "1", title: "Getting Started with Tirbeo", content: "Welcome to Tirbeo! This guide will help you set up your account, configure your profile, and explore the platform. Start by completing your profile in the Profile section, then enable two-factor authentication in Security for added protection.", category: "Getting Started", icon: "zap" },
  { id: "2", title: "How to Change Your Password", content: "Go to Security → Change Password. Enter your current password, then your new password (minimum 8 characters). We recommend using a mix of letters, numbers, and symbols. You'll be signed out of other devices after changing your password.", category: "Security", icon: "shield" },
  { id: "3", title: "Setting Up Two-Factor Authentication", content: "Navigate to Security → Two-Factor Authentication. You can use an authenticator app (Google Authenticator, Authy, etc.) or SMS verification. We strongly recommend enabling 2FA to protect your account from unauthorized access.", category: "Security", icon: "shield" },
  { id: "4", title: "Managing Your Notifications", content: "Go to Preferences → Notifications to configure what alerts you receive. You can choose between instant, daily, or weekly email digests. Security alerts are always sent immediately for your protection.", category: "Account", icon: "bell" },
  { id: "5", title: "Customizing Your Dashboard", content: "Open Preferences to personalize your experience. Change themes (light/dark/system), adjust fonts, modify colors, configure sidebar layout, and set your timezone and language. All changes are saved automatically.", category: "Account", icon: "globe" },
  { id: "6", title: "Connecting Third-Party Accounts", content: "Visit Integrations to connect Google, GitHub, and other services. Connected accounts let you sign in without a password. You can disconnect any provider at any time from the same page.", category: "Account", icon: "shield" },
  { id: "7", title: "Understanding Your Activity Log", content: "The Activity page shows a complete history of everything that happened on your account — sign-ins, password changes, settings updates, and more. Use the filters to find specific events. Security events are highlighted for easy identification.", category: "Account", icon: "globe" },
  { id: "8", title: "Managing Active Sessions", content: "In Security → Active Sessions, you can see all devices currently signed into your account. Revoke any session you don't recognize. We recommend reviewing sessions regularly and revoking old ones.", category: "Security", icon: "shield" },
  { id: "9", title: "Recovery Options", content: "Set up recovery email and phone in Security → Recovery Options. These help you regain access if you lose your 2FA device. Keep your recovery email verified and your phone number up to date.", category: "Security", icon: "shield" },
  { id: "10", title: "Backup Codes", content: "In Security → Backup Codes, you can generate one-time codes for emergency access. Each code can only be used once. Store them securely — they're your backup if you lose access to your authenticator app.", category: "Security", icon: "shield" },
  { id: "11", title: "Reporting a Bug", content: "Found a bug? Report it through our GitHub issues page or contact support directly. Include your browser, device, and steps to reproduce the issue. Our team will investigate and respond as quickly as possible.", category: "Support", icon: "bug" },
  { id: "12", title: "Privacy & Data", content: "Your privacy matters. You can export all your data from Preferences → Data & Privacy. To delete your account, go to the same section and follow the account deletion process. This action is irreversible.", category: "Account", icon: "globe" },
];

const ICON_MAP: Record<string, any> = {
  zap: Zap, shield: Shield, bell: Bell, globe: Globe, bug: Bug,
};

export default function HelpPage() {
  const [config, setConfig] = useState<HelpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const fetched = useRef(false);

  useEffect(function() {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/public/help-config", { credentials: "include" })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) { setConfig(d || { articles: DEFAULT_ARTICLES, contactEmail: "support@tirbeo.app", faqEnabled: true }); })
      .catch(function() { setConfig({ articles: DEFAULT_ARTICLES, contactEmail: "support@tirbeo.app", faqEnabled: true }); })
      .finally(function() { setLoading(false); });
  }, []);

  var articles = config?.articles || DEFAULT_ARTICLES;
  var categories = ["All"].concat(Array.from(new Set(articles.map(function(a) { return a.category; }))));

  var filteredArticles = articles.filter(function(a) {
    var matchesSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase());
    var matchesCategory = activeCategory === "All" || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <Skeleton count={3} height={80} />;

  return (
    <PageContainer>
      <PageHeader title="Help & Support" description="Find answers to common questions and get help with your account" />

      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-ash)", pointerEvents: "none" }} />
        <Input value={searchQuery} onChange={setSearchQuery} placeholder="Search help articles..." />
      </div>

      <FilterTabs
        tabs={categories.map(function(c) { return { id: c, label: c }; })}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {[
          { label: "Contact Support", desc: "Get in touch with our team", icon: Mail, href: "mailto:support@tirbeo.app" },
          { label: "Report a Bug", desc: "Found something wrong?", icon: Bug, href: "https://github.com/TIRBEO/tirbeo/issues" },
          { label: "Feature Request", desc: "Suggest an improvement", icon: MessageSquare, href: "https://github.com/TIRBEO/tirbeo/issues" },
        ].map(function(link) {
          return (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
              style={{ padding: "16px 18px", display: "block", textDecoration: "none", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", transition: "border-color 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <link.icon size={18} style={{ color: "var(--text-secondary)" }} />
                <ExternalLink size={12} style={{ color: "var(--text-ash)" }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{link.label}</p>
              <p style={{ fontSize: 11, color: "var(--text-ash)", margin: 0, marginTop: 3 }}>{link.desc}</p>
            </a>
          );
        })}
      </div>

      <Card>
        {filteredArticles.length === 0 ? (
          <EmptyState icon={HelpCircle} title="No articles found" description="Try a different search term" />
        ) : (
          <div>
            {filteredArticles.map(function(article) {
              var Icon = ICON_MAP[article.icon] || HelpCircle;
              var expanded = expandedId === article.id;
              return (
                <div key={article.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <button
                    onClick={function() { setExpandedId(expanded ? null : article.id); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={14} style={{ color: "var(--text-muted)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{article.title}</p>
                      <p style={{ fontSize: 11, color: "var(--text-ash)", margin: 0, marginTop: 2 }}>{article.category}</p>
                    </div>
                    {expanded ? <ChevronDown size={14} style={{ color: "var(--text-ash)" }} /> : <ChevronRight size={14} style={{ color: "var(--text-ash)" }} />}
                  </button>
                  {expanded && (
                    <div style={{ padding: "0 20px 16px 68px" }}>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{article.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div style={{ padding: "20px 24px", borderRadius: 12, textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          Can&apos;t find what you&apos;re looking for?{" "}
          <a href={"mailto:" + (config?.contactEmail || "support@tirbeo.app")} style={{ color: "var(--text)", textDecoration: "none", fontWeight: 500 }}>
            Contact support
          </a>
        </p>
      </div>
    </PageContainer>
  );
}
