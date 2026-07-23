"use client";

import { Eye } from "lucide-react";
import { useState } from "react";
import { PageContainer, PageHeader, Card, SettingRow, Toggle, Badge } from "../../components";

var PREVIEWS = [
  { id: "cmd-palette", name: "Command Palette 2.0", desc: "Redesigned command palette with fuzzy search and recent actions", enabled: false },
  { id: "dark-blue", name: "Midnight Blue Theme", desc: "New dark theme variant with deep blue accents", enabled: false },
  { id: "inline-editor", name: "Inline Profile Editor", desc: "Edit your profile directly from the dashboard", enabled: false },
];

export default function FeaturePreviewPage() {
  var [previews, setPreviews] = useState(PREVIEWS);

  var toggle = function(id: string) {
    setPreviews(function(p) { return p.map(function(x) { return x.id === id ? Object.assign({}, x, { enabled: !x.enabled }) : x; }); });
  };

  return (
    <PageContainer>
      <PageHeader title="Feature Preview" description="Preview upcoming features before they launch"
        action={<Badge variant="gold">Beta</Badge>} />

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {previews.map(function(p) {
            return (
              <SettingRow key={p.id} label={p.name} description={p.desc}>
                <Toggle checked={p.enabled} onChange={function() { toggle(p.id); }} />
              </SettingRow>
            );
          })}
        </div>
      </Card>
    </PageContainer>
  );
}
