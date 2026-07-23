"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Globe,
  Shield,
  Lock,
  User,
  Search,
  Database,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Settings,
  Ban,
  Plus,
  ChevronRight,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showOnlineStatus: boolean;
  showActivityStatus: boolean;
  allowReadReceipts: boolean;
  showLastActive: boolean;
  allowAnalytics: boolean;
  allowCrashReports: boolean;
  personalizedRecommendations: boolean;
  allowSearchEngines: boolean;
  showInDirectory: boolean;
}

const defaultSettings: PrivacySettings = {
  showEmail: false,
  showPhone: false,
  showLocation: true,
  showOnlineStatus: true,
  showActivityStatus: true,
  allowReadReceipts: true,
  showLastActive: true,
  allowAnalytics: false,
  allowCrashReports: true,
  personalizedRecommendations: false,
  allowSearchEngines: true,
  showInDirectory: true,
};

const STORAGE_KEY = "tirbeo-privacy-settings";

export default function PrivacyPage() {
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {}
  }, []);

  const updateSetting = (key: keyof PrivacySettings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    showToast("Privacy settings saved");
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tirbeo-privacy-settings.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported successfully");
  };

  const handleDeleteAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all your data? This action cannot be undone."
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      setSettings(defaultSettings);
      showToast("All data has been deleted");
    }
  };

  const toggle = (
    key: keyof PrivacySettings,
    label: string,
    description: string
  ) => (
    <div className="table-row">
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
          {label}
        </p>
        <p
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: 2,
          }}
        >
          {description}
        </p>
      </div>
      <div
        className={`toggle ${settings[key] ? "active" : ""}`}
        onClick={() => updateSetting(key, !settings[key])}
        role="switch"
        aria-checked={settings[key]}
        style={{ cursor: "pointer" }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            background: "var(--surface-elevated)",
            border: "1px solid var(--success, #238636)",
            borderRadius: 8,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--text)",
            zIndex: 9999,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          <CheckCircle size={14} style={{ color: "#238636" }} />
          {toast}
        </div>
      )}

      <div className="section-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={20} style={{ color: "var(--accent, #2f81f7)" }} />
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", margin: 0 }}>
            Privacy
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          Control your visibility and data sharing preferences
        </p>
      </div>

      <div className="card-section" style={{ marginTop: 24 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
          }}
        >
          Profile Visibility
        </p>
        <div className="divider" />
        {toggle("showEmail", "Show email", "Allow others to see your email address")}
        <div className="divider" />
        {toggle("showPhone", "Show phone", "Allow others to see your phone number")}
        <div className="divider" />
        {toggle(
          "showLocation",
          "Show location",
          "Display your district and location on your profile"
        )}
        <div className="divider" />
        {toggle(
          "showOnlineStatus",
          "Show online status",
          "Let others see when you are currently online"
        )}
      </div>

      <div className="card-section" style={{ marginTop: 16 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
          }}
        >
          Activity
        </p>
        <div className="divider" />
        {toggle(
          "showActivityStatus",
          "Show activity status",
          "Display what you are currently doing to others"
        )}
        <div className="divider" />
        {toggle(
          "allowReadReceipts",
          "Allow read receipts",
          "Let others know when you have read their messages"
        )}
        <div className="divider" />
        {toggle(
          "showLastActive",
          "Show last active",
          "Display when you were last active on the platform"
        )}
      </div>

      <div className="card-section" style={{ marginTop: 16 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
          }}
        >
          Searchability
        </p>
        <div className="divider" />
        {toggle(
          "allowSearchEngines",
          "Allow search engines to index profile",
          "Your profile may appear in Google and other search results"
        )}
        <div className="divider" />
        {toggle(
          "showInDirectory",
          "Show in directory",
          "Appear in the Tirbeo user directory for others to find you"
        )}
      </div>

      <div className="card-section" style={{ marginTop: 16 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
          }}
        >
          Data Sharing
        </p>
        <div className="divider" />
        {toggle(
          "allowAnalytics",
          "Allow analytics",
          "Help us improve by sharing anonymous usage data"
        )}
        <div className="divider" />
        {toggle(
          "allowCrashReports",
          "Allow crash reports",
          "Automatically send crash reports when something goes wrong"
        )}
        <div className="divider" />
        {toggle(
          "personalizedRecommendations",
          "Personalized recommendations",
          "Get content and people suggestions based on your activity"
        )}
      </div>

      <div className="card-section" style={{ marginTop: 16 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
          }}
        >
          Blocked Users
        </p>
        <div className="divider" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 0",
            gap: 12,
          }}
        >
          <Ban size={28} style={{ color: "var(--text-muted, #7b7e84)" }} />
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            No blocked users
          </p>
          <p style={{ fontSize: 11, color: "var(--text-muted, #6a6b6c)", margin: 0 }}>
            Users you block will not be able to contact you
          </p>
        </div>
      </div>

      <div className="card-section" style={{ marginTop: 16 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
          }}
        >
          Data
        </p>
        <div className="divider" />
        <div className="table-row">
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
              <Download size={14} />
              Export all data
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              Download a copy of your privacy settings and account data
            </p>
          </div>
          <button className="btn btn-ghost" onClick={handleExport} style={{ flexShrink: 0 }}>
            Export
          </button>
        </div>
        <div className="divider" />
        <div className="table-row">
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--danger, #da3633)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Trash2 size={14} />
              Delete all data
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              Permanently remove all your data from Tirbeo. This cannot be undone.
            </p>
          </div>
          <button className="btn btn-danger" onClick={handleDeleteAll} style={{ flexShrink: 0 }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
