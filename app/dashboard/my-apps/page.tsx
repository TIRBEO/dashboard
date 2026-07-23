"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  LayoutGrid,
  Users,
  Shield,
  LifeBuoy,
  Globe,
  Terminal,
  ArrowUpRight,
  ArrowRight,
  Plug,
  Sparkles,
  Box,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type AppEntry = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  external: boolean;
  status: "active" | "soon" | "connected";
};

type ConnectedIntegration = {
  provider: string;
  connected: boolean;
};

const ECOSYSTEM_APPS: AppEntry[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Central account management",
    icon: <LayoutGrid size={26} />,
    color: "#4f7aff",
    route: "/dashboard",
    external: false,
    status: "active",
  },
  {
    id: "collab",
    name: "Collab",
    description: "Real-time collaboration",
    icon: <Users size={26} />,
    color: "#59d499",
    route: "https://collab.tirbeo.app",
    external: true,
    status: "soon",
  },
  {
    id: "admin",
    name: "Admin Panel",
    description: "Staff moderation tools",
    icon: <Shield size={26} />,
    color: "#f472b6",
    route: "https://admin.tirbeo.app",
    external: true,
    status: "active",
  },
  {
    id: "support",
    name: "Support",
    description: "Help desk & FAQ",
    icon: <LifeBuoy size={26} />,
    color: "#ffb347",
    route: "https://support.tirbeo.app",
    external: true,
    status: "active",
  },
  {
    id: "landing",
    name: "Landing",
    description: "Company website",
    icon: <Globe size={26} />,
    color: "#c084fc",
    route: "https://tirbeo.app",
    external: true,
    status: "active",
  },
  {
    id: "api",
    name: "API Gateway",
    description: "API management",
    icon: <Terminal size={26} />,
    color: "#38bdf8",
    route: "https://api.tirbeo.app",
    external: true,
    status: "active",
  },
];

const OAUTH_APP_ICONS: Record<string, React.ReactNode> = {
  google: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.7)" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,0.6)" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.5)" />
    </svg>
  ),
  github: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
};

function AppCard({ app }: { app: AppEntry }) {
  return (
    <a
      href={app.route}
      target={app.external ? "_blank" : undefined}
      rel={app.external ? "noopener noreferrer" : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        borderRadius: 14,
        background: "rgba(8,8,10,0.72)",
        backdropFilter: "blur(40px) saturate(1.4)",
        WebkitBackdropFilter: "blur(40px) saturate(1.4)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "22px 20px 18px",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.2s ease, background 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        e.currentTarget.style.background = "rgba(12,12,14,0.82)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.background = "rgba(8,8,10,0.72)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent 0%, ${app.color}44 50%, transparent 100%)`,
          opacity: 0.6,
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: `${app.color}18`,
            border: `1px solid ${app.color}22`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: app.color,
            flexShrink: 0,
          }}
        >
          {app.icon}
        </div>

        {app.external ? (
          <ArrowUpRight size={14} style={{ color: "#6a6b6c", marginTop: 2, flexShrink: 0 }} />
        ) : (
          <ArrowRight size={14} style={{ color: "#6a6b6c", marginTop: 2, flexShrink: 0 }} />
        )}
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, color: "#f4f4f6", letterSpacing: "-0.01em", marginBottom: 4 }}>
        {app.name}
      </div>

      <div style={{ fontSize: 12.5, color: "#9c9c9d", lineHeight: 1.4, marginBottom: 14, flex: 1 }}>
        {app.description}
      </div>

      <div>
        {app.status === "active" && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 9px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background: "rgba(89,212,153,0.1)",
              color: "#59d499",
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#59d499" }} />
            Active
          </span>
        )}
        {app.status === "soon" && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 9px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background: "rgba(255,197,51,0.1)",
              color: "#ffc533",
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ffc533" }} />
            Soon
          </span>
        )}
        {app.status === "connected" && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 9px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background: "rgba(79,122,255,0.1)",
              color: "#4f7aff",
            }}
          >
            <Plug size={10} />
            Connected
          </span>
        )}
      </div>
    </a>
  );
}

function IntegrationCard({ integration }: { integration: ConnectedIntegration }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {OAUTH_APP_ICONS[integration.provider] || (
          <Plug size={18} style={{ color: "#9c9c9d" }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#f4f4f6", textTransform: "capitalize" }}>
          {integration.provider}
        </div>
        <div style={{ fontSize: 11.5, color: "#9c9c9d", marginTop: 1 }}>
          {integration.connected ? "Linked to your account" : "Not connected"}
        </div>
      </div>
      {integration.connected && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 9px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            background: "rgba(79,122,255,0.1)",
            color: "#4f7aff",
          }}
        >
          <Plug size={10} />
          Connected
        </span>
      )}
    </div>
  );
}

export default function MyAppsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [connectedApps, setConnectedApps] = useState<ConnectedIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/integrations`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.providers)) {
          setConnectedApps(data.providers);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return ECOSYSTEM_APPS;
    const q = searchQuery.toLowerCase();
    return ECOSYSTEM_APPS.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredIntegrations = useMemo(() => {
    if (!searchQuery.trim()) return connectedApps;
    const q = searchQuery.toLowerCase();
    return connectedApps.filter((i) => i.provider.toLowerCase().includes(q));
  }, [searchQuery, connectedApps]);

  const showConnected = filteredIntegrations.length > 0 && !searchQuery.trim();

  return (
    <div style={{ padding: "24px 0" }}>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h1>My Apps</h1>
        <p>Access all Tirbeo ecosystem apps and connected integrations</p>
      </div>

      <div style={{ marginBottom: 24, position: "relative" }}>
        <Search
          size={15}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6a6b6c",
            pointerEvents: "none",
          }}
        />
        <input
          className="input-field"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: 38, height: 40, borderRadius: 10 }}
        />
      </div>

      {showConnected && (
        <div className="glass" style={{ marginBottom: 20 }}>
          <div className="card-section">
            <div className="flex items-center gap-2.5" style={{ marginBottom: 4 }}>
              <Sparkles size={15} style={{ color: "#d8b36a" }} />
              <h3 style={{ marginBottom: 0 }}>Connected</h3>
            </div>
            <p style={{ fontSize: 13, color: "#9c9c9d", marginBottom: 18 }}>
              OAuth integrations linked to your account
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
              {filteredIntegrations.map((integration) => (
                <IntegrationCard key={integration.provider} integration={integration} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="glass">
        <div className="card-section">
          <div className="flex items-center gap-2.5" style={{ marginBottom: 4 }}>
            <Box size={15} style={{ color: "#d8b36a" }} />
            <h3 style={{ marginBottom: 0 }}>Tirbeo Ecosystem</h3>
          </div>
          <p style={{ fontSize: 13, color: "#9c9c9d", marginBottom: 20 }}>
            All platform apps and services
          </p>

          {filteredApps.length === 0 ? (
            <div className="empty-state" style={{ padding: "36px 24px" }}>
              <Search size={28} style={{ color: "#434345", marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: "#9c9c9d", marginBottom: 4 }}>
                No apps match your search
              </div>
              <div style={{ fontSize: 12, color: "#6a6b6c" }}>
                Try a different keyword
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 12,
              }}
            >
              {filteredApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </div>
      </div>

      {!loading && connectedApps.length === 0 && !searchQuery.trim() && (
        <div
          style={{
            marginTop: 16,
            padding: "14px 18px",
            borderRadius: 10,
            background: "rgba(216,179,106,0.06)",
            border: "1px solid rgba(216,179,106,0.12)",
            fontSize: 12.5,
            color: "#d8b36a",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Plug size={14} style={{ flexShrink: 0 }} />
          <span>
            No connected integrations yet.{" "}
            <a
              href="/dashboard/integrations"
              style={{ color: "#d8b36a", textDecoration: "underline", textUnderlineOffset: 2 }}
            >
              Connect an account
            </a>{" "}
            to see it here.
          </span>
        </div>
      )}
    </div>
  );
}
