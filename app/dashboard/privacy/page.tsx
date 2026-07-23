"use client";

import { useState, useEffect } from "react";
import { Download, Trash2, Ban } from "lucide-react";
import { normalizePreferenceState, applyPreferenceStyles } from "../../preferences-theme";
import { PageContainer, PageHeader, Card, SettingRow, Toggle, Button, EmptyState, Toast, useToast } from "../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";
const STORAGE_KEY = "tirbeo-privacy-settings";

interface PrivacySettings {
  showEmail: boolean; showPhone: boolean; showLocation: boolean; showOnlineStatus: boolean;
  showActivityStatus: boolean; allowReadReceipts: boolean; showLastActive: boolean;
  allowAnalytics: boolean; allowCrashReports: boolean; personalizedRecommendations: boolean;
  allowSearchEngines: boolean; showInDirectory: boolean;
}

const defaultSettings: PrivacySettings = {
  showEmail: false, showPhone: false, showLocation: true, showOnlineStatus: true,
  showActivityStatus: true, allowReadReceipts: true, showLastActive: true,
  allowAnalytics: false, allowCrashReports: true, personalizedRecommendations: false,
  allowSearchEngines: true, showInDirectory: true,
};

export default function PrivacyPage() {
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const toast = useToast();

  useEffect(function() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings(Object.assign({}, defaultSettings, JSON.parse(stored)));
    } catch (e) {}

    fetch(API + "/api/preferences", { credentials: "include" })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(data) {
        const normalized = normalizePreferenceState(data);
        applyPreferenceStyles(normalized);
      })
      .catch(function() {});
  }, []);

  var updateSetting = function(key: keyof PrivacySettings, value: boolean) {
    var next = Object.assign({}, settings, Object.fromEntries([[key, value]]));
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    fetch(API + "/api/preferences", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences: { privacy: next } }),
    }).catch(function() {});
    toast.show("Privacy settings saved");
  };

  var handleExport = function() {
    var blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "tirbeo-privacy-settings.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.show("Data exported successfully");
  };

  var handleDeleteAll = function() {
    if (window.confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      setSettings(defaultSettings);
      toast.show("All data has been deleted");
    }
  };

  return (
    <PageContainer>
      {toast.toast && <Toast message={toast.toast.message} type={toast.toast.type} onClose={toast.hide} />}

      <PageHeader title="Privacy" description="Control your visibility and data sharing preferences" />

      <Card title="Profile Visibility">
        <div>
          <SettingRow label="Show email" description="Allow others to see your email address">
            <Toggle checked={settings.showEmail} onChange={function() { updateSetting("showEmail", !settings.showEmail); }} />
          </SettingRow>
          <SettingRow label="Show phone" description="Allow others to see your phone number">
            <Toggle checked={settings.showPhone} onChange={function() { updateSetting("showPhone", !settings.showPhone); }} />
          </SettingRow>
          <SettingRow label="Show location" description="Display your district and location on your profile">
            <Toggle checked={settings.showLocation} onChange={function() { updateSetting("showLocation", !settings.showLocation); }} />
          </SettingRow>
          <SettingRow label="Show online status" description="Let others see when you are currently online">
            <Toggle checked={settings.showOnlineStatus} onChange={function() { updateSetting("showOnlineStatus", !settings.showOnlineStatus); }} />
          </SettingRow>
        </div>
      </Card>

      <Card title="Activity">
        <div>
          <SettingRow label="Show activity status" description="Display what you are currently doing to others">
            <Toggle checked={settings.showActivityStatus} onChange={function() { updateSetting("showActivityStatus", !settings.showActivityStatus); }} />
          </SettingRow>
          <SettingRow label="Allow read receipts" description="Let others know when you have read their messages">
            <Toggle checked={settings.allowReadReceipts} onChange={function() { updateSetting("allowReadReceipts", !settings.allowReadReceipts); }} />
          </SettingRow>
          <SettingRow label="Show last active" description="Display when you were last active on the platform">
            <Toggle checked={settings.showLastActive} onChange={function() { updateSetting("showLastActive", !settings.showLastActive); }} />
          </SettingRow>
        </div>
      </Card>

      <Card title="Searchability">
        <div>
          <SettingRow label="Allow search engines to index profile" description="Your profile may appear in Google and other search results">
            <Toggle checked={settings.allowSearchEngines} onChange={function() { updateSetting("allowSearchEngines", !settings.allowSearchEngines); }} />
          </SettingRow>
          <SettingRow label="Show in directory" description="Appear in the Tirbeo user directory for others to find you">
            <Toggle checked={settings.showInDirectory} onChange={function() { updateSetting("showInDirectory", !settings.showInDirectory); }} />
          </SettingRow>
        </div>
      </Card>

      <Card title="Data Sharing">
        <div>
          <SettingRow label="Allow analytics" description="Help us improve by sharing anonymous usage data">
            <Toggle checked={settings.allowAnalytics} onChange={function() { updateSetting("allowAnalytics", !settings.allowAnalytics); }} />
          </SettingRow>
          <SettingRow label="Allow crash reports" description="Automatically send crash reports when something goes wrong">
            <Toggle checked={settings.allowCrashReports} onChange={function() { updateSetting("allowCrashReports", !settings.allowCrashReports); }} />
          </SettingRow>
          <SettingRow label="Personalized recommendations" description="Get content and people suggestions based on your activity">
            <Toggle checked={settings.personalizedRecommendations} onChange={function() { updateSetting("personalizedRecommendations", !settings.personalizedRecommendations); }} />
          </SettingRow>
        </div>
      </Card>

      <Card title="Blocked Users">
        <EmptyState icon={Ban} title="No blocked users" description="Users you block will not be able to contact you" />
      </Card>

      <Card title="Data">
        <div>
          <SettingRow label="Export all data" description="Download a copy of your privacy settings and account data">
            <Button variant="ghost" size="sm" onClick={handleExport}><Download size={12} /> Export</Button>
          </SettingRow>
          <SettingRow label="Delete all data" description="Permanently remove all your data from Tirbeo. This cannot be undone." border={false}>
            <Button variant="danger" size="sm" onClick={handleDeleteAll}><Trash2 size={12} /> Delete</Button>
          </SettingRow>
        </div>
      </Card>
    </PageContainer>
  );
}
