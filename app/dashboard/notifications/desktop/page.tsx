"use client";

import { useState } from "react";
import { Monitor } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  SettingRow,
  Toggle,
  Button,
} from "../../components";

const DESKTOP_ITEMS = [
  { key: "desktopEnabled", label: "Desktop Notifications", desc: "Show native OS notifications" },
  { key: "soundEnabled", label: "Notification Sound", desc: "Play a sound when notifications arrive" },
  { key: "badgeEnabled", label: "Taskbar Badge", desc: "Show unread count on app icon" },
  { key: "mentions", label: "Mentions", desc: "Desktop notification for mentions" },
  { key: "directMessages", label: "Direct Messages", desc: "Desktop notification for DMs" },
  { key: "taskUpdates", label: "Task Updates", desc: "Desktop notification for task changes" },
];

export default function DesktopNotificationsPage() {
  const [settings, setSettings] = useState({
    desktopEnabled: true,
    soundEnabled: true,
    badgeEnabled: true,
    mentions: true,
    directMessages: true,
    taskUpdates: false,
  });

  const toggle = (key: string) =>
    setSettings((s) => ({ ...s, [key]: !s[key as keyof typeof s] }));

  return (
    <PageContainer className="max-w-2xl">
      <PageHeader
        title="Desktop Notifications"
        description="Native OS notification settings for desktop browsers"
      />

      <Card title="Desktop Settings" subtitle="Configure native desktop notification behavior">
        {DESKTOP_ITEMS.map((item, i) => (
          <SettingRow
            key={item.key}
            label={item.label}
            description={item.desc}
            border={i < DESKTOP_ITEMS.length - 1}
          >
            <Toggle
              checked={settings[item.key as keyof typeof settings]}
              onChange={() => toggle(item.key)}
            />
          </SettingRow>
        ))}
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="gold">Save Desktop Settings</Button>
      </div>
    </PageContainer>
  );
}
