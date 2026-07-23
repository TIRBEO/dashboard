"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Globe, Clock, Zap, Palette, Type, Moon } from "lucide-react";
import { PREFERENCES_PAGE } from "../../dashboard-config";
import { normalizePreferenceState, applyPreferenceStyles } from "../../preferences-theme";
import { PageContainer, PageHeader, Card, SettingRow, Toggle, Button, Select, Skeleton, useToast } from "../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Prefs = {
  theme: string | null; language: string | null; timezone: string | null;
  dateFormat: string | null; timeFormat: string | null; fontSize: string | null;
  reduceMotion: boolean; highContrast: boolean;
  weekStart?: string | null; currency?: string | null; defaultLanding?: string | null;
  preferences?: Record<string, any>;
} | null;

const SECTION_ICONS: Record<string, any> = { Globe, Clock, Zap, Palette, Type, Moon };

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fetched = useRef(false);
  const toast = useToast();
  const originalPrefs = useRef<Prefs>(null);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/preferences", { credentials: "include" }).then(function(r) { return r.ok ? r.json() : null; }).then(function(data) {
      const normalized = normalizePreferenceState(data);
      setPrefs(normalized as Prefs);
      originalPrefs.current = JSON.parse(JSON.stringify(normalized));
      applyPreferenceStyles(normalized);
    }).catch(function() {});
  }, []);

  const update = useCallback(function(key: string, val: any) {
    setPrefs(function(prev) { return prev ? Object.assign({}, prev, Object.fromEntries([[key, val]])) : prev; });
    setDirty(true);
  }, []);

  const updateAppearance = useCallback(function(key: string, val: any) {
    setPrefs(function(prev) { return prev ? Object.assign({}, prev, { preferences: Object.assign({}, prev.preferences || {}, Object.fromEntries([[key, val]])) }) : prev; });
    setDirty(true);
  }, []);

  const save = useCallback(async function() {
    if (!prefs) return;
    setSaving(true);
    try {
      const normalized = normalizePreferenceState(prefs as Prefs);
      applyPreferenceStyles(normalized);
      var res = await fetch(API + "/api/preferences", {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
      });
      if (res.ok) {
        toast.show("Preferences saved");
        setDirty(false);
        originalPrefs.current = JSON.parse(JSON.stringify(normalized));
      } else {
        toast.show("Failed to save preferences", "error");
      }
    } catch (e) {
      toast.show("Connection error", "error");
    }
    setSaving(false);
  }, [prefs, toast]);

  const reset = useCallback(function() {
    if (originalPrefs.current) {
      setPrefs(JSON.parse(JSON.stringify(originalPrefs.current)));
      applyPreferenceStyles(originalPrefs.current);
      setDirty(false);
      toast.show("Reverted to last saved");
    }
  }, [toast]);

  if (!prefs) return <Skeleton count={3} height={120} />;

  var generalSection = PREFERENCES_PAGE.sections.find(function(s) { return s.id === "general"; });
  var behaviorSection = PREFERENCES_PAGE.sections.find(function(s) { return s.id === "behavior"; });

  return (
    <PageContainer>
      <PageHeader
        title="Preferences"
        description="Customize your experience and dashboard look"
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {dirty && (
              <Button variant="ghost" size="sm" onClick={reset}>Revert</Button>
            )}
            <Button variant="primary" size="sm" onClick={save} disabled={saving || !dirty} className={dirty ? "" : " opacity-50"}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      />

      {PREFERENCES_PAGE.sections.map(function(section) {
        var SectionIcon = SECTION_ICONS[section.icon] || Globe;
        return (
          <Card key={section.id} title={section.label} subtitle={section.description}
            action={<SectionIcon size={14} style={{ color: "var(--text-muted)" }} />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {section.id === "general" && (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Theme</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["light", "dark", "system"].map(function(t) {
                        return (
                          <Button key={t} variant={prefs.theme === t ? "primary" : "ghost"} size="sm"
                            onClick={function() { update("theme", t); }}
                            className="flex-1" style={{ textTransform: "capitalize", justifyContent: "center" }}>
                            {t}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  {generalSection && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                      {generalSection.fields.map(function(field) {
                        return (
                          <Select key={field.name} label={field.label}
                            value={String(prefs[field.name as keyof Prefs] || field.defaultValue || "")}
                            onChange={function(v) { update(field.name, v); }}
                            options={field.options || []} />
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {section.id === "behavior" && behaviorSection && (
                <div>
                  {behaviorSection.fields.map(function(field) {
                    return (
                      <SettingRow key={field.name} label={field.label} description={field.description} border={false}>
                        <Toggle
                          checked={!!(prefs.preferences?.[field.name] ?? field.defaultValue)}
                          onChange={function() { updateAppearance(field.name, !(prefs.preferences?.[field.name] ?? field.defaultValue)); }} />
                      </SettingRow>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        );
      })}

      <Card title="Appearance" subtitle="Customize the visual style">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Accent Color</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["#ffffff", "#7aa2f7", "#59d499", "#ffb347", "#f472b6", "#c084fc", "#fb7185", "#38bdf8"].map(function(c) {
                return (
                  <button key={c} onClick={function() { updateAppearance("accentColor", c); }}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", background: c, border: "none",
                      cursor: "pointer", outline: prefs.preferences?.accentColor === c ? "2px solid var(--accent)" : "2px solid transparent",
                      outlineOffset: 2,
                    }} />
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <Select label="Shell Style" value={prefs.preferences?.shellStyle || "dark"}
              onChange={function(v) { updateAppearance("shellStyle", v); }}
              options={[{ label: "Dark", value: "dark" }, { label: "Midnight", value: "midnight" }]} />
            <Select label="Density" value={prefs.preferences?.density || "comfortable"}
              onChange={function(v) { updateAppearance("density", v); }}
              options={[{ label: "Compact", value: "compact" }, { label: "Comfortable", value: "comfortable" }, { label: "Spacious", value: "spacious" }]} />
            <Select label="Sidebar Width" value={prefs.preferences?.sidebarWidth || "wide"}
              onChange={function(v) { updateAppearance("sidebarWidth", v); }}
              options={[{ label: "Wide (260px)", value: "wide" }, { label: "Compact (220px)", value: "compact" }]} />
            <Select label="Font Scale" value={prefs.preferences?.fontScale || "default"}
              onChange={function(v) { updateAppearance("fontScale", v); }}
              options={[{ label: "Small", value: "small" }, { label: "Default", value: "default" }, { label: "Large", value: "large" }]} />
            <Select label="Glass Blur" value={String(prefs.preferences?.blurIntensity || 40)}
              onChange={function(v) { updateAppearance("blurIntensity", v); }}
              options={[{ label: "None", value: "0" }, { label: "Light (20px)", value: "20" }, { label: "Default (40px)", value: "40" }, { label: "Heavy (60px)", value: "60" }]} />
            <Select label="Rounded Corners" value={prefs.preferences?.roundedCorners || "16"}
              onChange={function(v) { updateAppearance("roundedCorners", v); }}
              options={[{ label: "None (0px)", value: "0" }, { label: "Small (8px)", value: "8" }, { label: "Default (16px)", value: "16" }, { label: "Large (24px)", value: "24" }]} />
          </div>

          <SettingRow label="Glass Effect" description="Frosted glass panels with backdrop blur" border={false}>
            <Toggle checked={prefs.preferences?.glassEffect !== false}
              onChange={function() { updateAppearance("glassEffect", prefs.preferences?.glassEffect === false); }} />
          </SettingRow>
          <SettingRow label="Transparency" description="Transparent panel backgrounds" border={false}>
            <Toggle checked={prefs.preferences?.transparency !== false}
              onChange={function() { updateAppearance("transparency", prefs.preferences?.transparency === false); }} />
          </SettingRow>
        </div>
      </Card>

      <Card title="Typography" subtitle="Font and text settings">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <Select label="Font Family" value={prefs.preferences?.fontFamily || "Inter"}
              onChange={function(v) { updateAppearance("fontFamily", v); }}
              options={[{ label: "Inter", value: "Inter" }, { label: "System", value: "system" }, { label: "JetBrains Mono", value: "JetBrains Mono" }, { label: "SF Pro", value: "SF Pro" }]} />
            <Select label="Font Size" value={prefs.fontSize || "default"}
              onChange={function(v) { update("fontSize", v); }}
              options={[{ label: "Small (13px)", value: "small" }, { label: "Default (14px)", value: "default" }, { label: "Large (15px)", value: "large" }, { label: "Extra Large (16px)", value: "extra-large" }]} />
            <Select label="Animation Speed" value={prefs.preferences?.animationSpeed || "normal"}
              onChange={function(v) { updateAppearance("animationSpeed", v); }}
              options={[{ label: "Instant", value: "instant" }, { label: "Fast", value: "fast" }, { label: "Normal", value: "normal" }, { label: "Slow", value: "slow" }]} />
          </div>
          <SettingRow label="Reduce Motion" description="Minimize animations for accessibility" border={false}>
            <Toggle checked={!!prefs.reduceMotion}
              onChange={function() { update("reduceMotion", !prefs.reduceMotion); }} />
          </SettingRow>
          <SettingRow label="High Contrast" description="Increase contrast for visibility" border={false}>
            <Toggle checked={!!prefs.highContrast}
              onChange={function() { update("highContrast", !prefs.highContrast); }} />
          </SettingRow>
        </div>
      </Card>
    </PageContainer>
  );
}
