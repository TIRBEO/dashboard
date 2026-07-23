"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  SettingRow,
  Toggle,
  Button,
  ToggleGroup,
} from "../../components";

const INCLUDE_ITEMS = [
  { key: "includeMentions", label: "Mentions & Tags" },
  { key: "includeMessages", label: "Direct Messages" },
  { key: "includeActivity", label: "General Activity" },
  { key: "includeWorkspace", label: "Workspace Updates" },
];

const FREQ_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Biweekly", value: "biweekly" },
];

export default function DigestPage() {
  const [settings, setSettings] = useState({
    digestEnabled: true,
    frequency: "daily",
    time: "09:00",
    includeMentions: true,
    includeMessages: true,
    includeActivity: true,
    includeWorkspace: false,
  });

  return (
    <PageContainer className="max-w-2xl">
      <PageHeader
        title="Digest"
        description="Get a summary of activity sent to your email"
      />

      <Card title="Digest Settings" subtitle="Configure your email digest preferences">
        <SettingRow label="Enable Digest Emails" description="Receive a summary of activity">
          <Toggle
            checked={settings.digestEnabled}
            onChange={() => setSettings((s) => ({ ...s, digestEnabled: !s.digestEnabled }))}
          />
        </SettingRow>

        <SettingRow label="Frequency" description="How often to send digest emails">
          <ToggleGroup
            options={FREQ_OPTIONS}
            value={settings.frequency}
            onChange={(v) => setSettings((s) => ({ ...s, frequency: v }))}
          />
        </SettingRow>

        <SettingRow label="Preferred Time" description="Time of day to send the digest">
          <input
            type="time"
            value={settings.time}
            onChange={(e) => setSettings((s) => ({ ...s, time: e.target.value }))}
            className="input-field"
            style={{ width: 140 }}
          />
        </SettingRow>

        {INCLUDE_ITEMS.map((item, i) => (
          <SettingRow
            key={item.key}
            label={item.label}
            border={i < INCLUDE_ITEMS.length - 1}
          >
            <Toggle
              checked={!!settings[item.key as keyof typeof settings]}
              onChange={() => setSettings((s) => ({ ...s, [item.key]: !s[item.key as keyof typeof s] }))}
            />
          </SettingRow>
        ))}
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="gold">Save Digest Settings</Button>
      </div>
    </PageContainer>
  );
}
