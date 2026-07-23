"use client";

import { useState, useEffect, useRef } from "react";
import { Link2, Unlink, ExternalLink, Lock, Clock } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, Toast, useToast } from "../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Profile = {
  hasPassword: boolean; hasGoogle: boolean; hasGithub: boolean;
};

const OAUTH_PROVIDERS = [
  {
    id: "google", name: "Google", description: "Sign in with your Google account",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="rgba(255,255,255,0.9)"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.7)"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,0.6)"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.5)"/>
      </svg>
    ),
  },
  {
    id: "github", name: "GitHub", description: "Sign in with your GitHub account",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
];

const COMING_SOON = [
  { id: "apple", name: "Apple", description: "Sign in with Apple ID" },
  { id: "microsoft", name: "Microsoft", description: "Sign in with Microsoft account" },
  { id: "discord", name: "Discord", description: "Sign in with Discord" },
  { id: "slack", name: "Slack", description: "Connect your Slack workspace" },
  { id: "notion", name: "Notion", description: "Connect Notion for content" },
  { id: "linear", name: "Linear", description: "Connect Linear for issues" },
];

export default function IntegrationsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const fetched = useRef(false);
  const toast = useToast();

  useEffect(function() {
    if (fetched.current) return;
    fetched.current = true;

    var params = new URLSearchParams(window.location.search);
    var connectedProvider = params.get("connected");
    var error = params.get("error");
    if (connectedProvider) { toast.show(connectedProvider + " connected successfully"); window.history.replaceState({}, "", window.location.pathname); }
    if (error) { toast.show("Failed to connect: " + error, "error"); window.history.replaceState({}, "", window.location.pathname); }

    fetch(API + "/api/profile", { credentials: "include" }).then(function(r) { return r.ok ? r.json() : null; }).then(setProfile).catch(function() {}).finally(function() { setLoading(false); });
  }, []);

  var isConnected = function(id: string) {
    if (!profile) return false;
    if (id === "google") return profile.hasGoogle;
    if (id === "github") return profile.hasGithub;
    return false;
  };

  var handleConnect = function(provider: string) {
    setConnecting(provider);
    window.location.href = API + "/api/auth/" + provider + "?redirect=" + encodeURIComponent(window.location.origin + "/dashboard/integrations?connected=" + provider);
  };

  var handleDisconnect = function(provider: string) {
    if (!window.confirm("Disconnect " + provider + "? You'll need to reconnect your " + provider + " account to sign in with it again.")) return;
    fetch(API + "/api/integrations", {
      method: "DELETE", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: provider }),
    }).then(function() {
      setProfile(function(prev) { return prev ? Object.assign({}, prev, Object.fromEntries([[provider === "google" ? "hasGoogle" : "hasGithub", false]])) : prev; });
      toast.show(provider + " disconnected");
    }).catch(function() { toast.show("Failed to disconnect", "error"); });
  };

  if (loading) return <Skeleton count={2} height={120} />;

  return (
    <PageContainer>
      {toast.toast && <Toast message={toast.toast.message} type={toast.toast.type} onClose={toast.hide} />}

      <PageHeader title="Integrations" description="Connect your accounts and manage third-party services" />

      <Card title="Connected Accounts" subtitle="Connect your accounts to sign in seamlessly across Tirbeo services.">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {OAUTH_PROVIDERS.map(function(p) {
            var connected = isConnected(p.id);
            return (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px", borderRadius: 12,
                background: connected ? "rgba(255,255,255,0.03)" : "transparent",
                border: "1px solid " + (connected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"),
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {p.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{p.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, marginTop: 2 }}>{p.description}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {connected && <Badge>Connected</Badge>}
                  {connected ? (
                    <Button variant="ghost" size="sm" onClick={function() { handleDisconnect(p.id); }}>
                      <Unlink size={12} /> Disconnect
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={function() { handleConnect(p.id); }} disabled={connecting !== null}>
                      <ExternalLink size={12} /> {connecting === p.id ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Coming Soon" subtitle="These integrations will be available soon. Admin will enable them.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {COMING_SOON.map(function(p) {
            return (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", opacity: 0.6,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Lock size={14} style={{ color: "var(--text-ash)" }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", margin: 0 }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-ash)", margin: 0 }}>{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </PageContainer>
  );
}
