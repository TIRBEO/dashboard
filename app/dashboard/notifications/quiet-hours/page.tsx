"use client";

import { useState } from "react";
import { Moon } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  SettingRow,
  Toggle,
  Button,
  Select,
} from "../../components";

const TIMEZONE_OPTIONS = [
  { label: "Nepal (UTC+5:45)", value: "Asia/Kathmandu" },
  { label: "UTC", value: "UTC" },
  { label: "Eastern (UTC-5)", value: "America/New_York" },
  { label: "Pacific (UTC-8)", value: "America/Los_Angeles" },
  { label: "London (UTC+0)", value: "Europe/London" },
  { label: "Tokyo (UTC+9)", value: "Asia/Tokyo" },
];

export default function QuietHoursPage() {
  const [settings, setSettings] = useState({
    enabled: true,
    start: "22:00",
    end: "08:00",
    timezone: "Asia/Kathmandu",
    allowUrgent: true,
    weekendMode: false,
  });

  return (
    <PageContainer className="max-w-2xl">
      <PageHeader
        title="Quiet Hours"
        description="Pause notifications during focus or sleep time"
      />

      <Card title="Quiet Hours" subtitle="Silence notifications during set hours">
        <SettingRow label="Enable Quiet Hours" description="Silence all notifications during set hours">
          <Toggle
            checked={settings.enabled}
            onChange={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
          />
        </SettingRow>

        <SettingRow label="Start Time">
          <input
            type="time"
            value={settings.start}
            onChange={(e) => setSettings((s) => ({ ...s, start: e.target.value }))}
            className="input-field"
            style={{ width: 140 }}
          />
        </SettingRow>

        <SettingRow label="End Time">
          <input
            type="time"
            value={settings.end}
            onChange={(e) => setSettings((s) => ({ ...s, end: e.target.value }))}
            className="input-field"
            style={{ width: 140 }}
          />
        </SettingRow>

        <SettingRow label="Timezone" description="Timezone for quiet hours schedule">
          <Select
            value={settings.timezone}
            onChange={(v) => setSettings((s) => ({ ...s, timezone: v }))}
            options={TIMEZONE_OPTIONS}
          />
        </SettingRow>

        <SettingRow label="Allow Urgent Messages" description="Override quiet hours for marked urgent">
          <Toggle
            checked={settings.allowUrgent}
            onChange={() => setSettings((s) => ({ ...s, allowUrgent: !s.allowUrgent }))}
          />
        </SettingRow>

        <SettingRow label="Weekend Mode" description="Extended quiet hours on weekends" border={false}>
          <Toggle
            checked={settings.weekendMode}
            onChange={() => setSettings((s) => ({ ...s, weekendMode: !s.weekendMode }))}
          />
        </SettingRow>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="gold">Save Quiet Hours</Button>
      </div>
    </PageContainer>
  );
}
