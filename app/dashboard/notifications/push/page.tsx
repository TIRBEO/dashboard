"use client";

import { useState } from "react";
import { Bell, Smartphone } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  SettingRow,
  Toggle,
  Button,
  EmptyState,
} from "../../components";

const PUSH_ITEMS = [
  { key: "pushEnabled", label: "Enable Push Notifications", desc: "Receive push notifications in browser and mobile" },
  { key: "mentions", label: "Mentions", desc: "When someone mentions you in a conversation" },
  { key: "directMessages", label: "Direct Messages", desc: "New direct message notifications" },
  { key: "workspaceUpdates", label: "Workspace Updates", desc: "Changes and updates in your workspaces" },
  { key: "systemAlerts", label: "System Alerts", desc: "Important system announcements" },
  { key: "marketingPush", label: "Marketing", desc: "Product updates and feature announcements" },
];

export default function PushNotificationsPage() {
  const [settings, setSettings] = useState({
    pushEnabled: true,
    mentions: true,
    directMessages: true,
    workspaceUpdates: true,
    systemAlerts: true,
    marketingPush: false,
  });

  const toggle = (key: string) =>
    setSettings((s) => ({ ...s, [key]: !s[key as keyof typeof s] }));

  return (
    <PageContainer className="max-w-2xl">
      <PageHeader
        title="Push Notifications"
        description="Configure browser and mobile push notifications"
      />

      <Card title="Push Settings" subtitle="Manage which push notifications you receive">
        {PUSH_ITEMS.map((item, i) => (
          <SettingRow
            key={item.key}
            label={item.label}
            description={item.desc}
            border={i < PUSH_ITEMS.length - 1}
          >
            <Toggle
              checked={settings[item.key as keyof typeof settings]}
              onChange={() => toggle(item.key)}
            />
          </SettingRow>
        ))}
      </Card>

      <Card title="Registered Devices">
        <EmptyState
          icon={Smartphone}
          title="No push-enabled devices registered"
          description="Enable push in your browser or install the mobile app."
        />
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="gold">Save Push Settings</Button>
      </div>
    </PageContainer>
  );
}
