"use client";

import { useState } from "react";
import { Palette, Layout, Type, Accessibility, Zap, Save } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

export default function AppearanceLayoutPage() {
  const [sidebarStyle, setSidebarStyle] = useState("fixed");
  const [sidebarWidth, setSidebarWidth] = useState("wide");
  const [density, setDensity] = useState("comfortable");
  const [glassEffect, setGlassEffect] = useState(true);
  const [transparency, setTransparency] = useState(false);
  const [roundedCorners, setRoundedCorners] = useState("16");

  const saveSettings = async () => {
    try {
      await fetch(`${API}/api/preferences`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: "dark",
          fontSize: "14",
          reduceMotion: false,
          highContrast: false,
          preferences: {
            accentColor: "#ffffff",
            sidebarStyle,
            density,
            glassEffect,
            transparency,
            roundedCorners: Number(roundedCorners),
            fontFamily: "Inter",
            animationSpeed: "normal",
            showLabels: true,
            collapseByDefault: false,
            iconSize: 18,
          },
        }),
      });
      alert("Layout settings saved!");
    } catch {
      alert("Failed to save layout settings");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Layout Settings</h1>
        <p className="text-muted-foreground">Configure your layout preferences and visual behavior</p>
      </div>

      <div className="glass card-section space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Sidebar Layout</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Sidebar Style</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "fixed", label: "Fixed", desc: "Always visible" },
                  { value: "floating", label: "Floating", desc: "Hover to reveal" },
                  { value: "compact", label: "Compact", desc: "Minimalist" },
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setSidebarStyle(style.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${sidebarStyle === style.value
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-surface border-hairline text-muted-foreground hover:border-primary/30"
                      }`}
                  >
                    <div className="font-medium text-sm">{style.label}</div>
                    <div className="text-xs mt-1">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Sidebar Width</label>
              <div className="flex gap-2">
                {[
                  { value: "compact", label: "Compact (220px)" },
                  { value: "wide", label: "Wide (260px)" },
                  { value: "auto", label: "Auto" },
                ].map((width) => (
                  <button
                    key={width.value}
                    onClick={() => setSidebarWidth(width.value)}
                    className={`px-4 py-2 rounded-lg border transition-colors text-sm ${sidebarWidth === width.value
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-surface border-hairline text-muted-foreground hover:border-primary/30"
                      }`}
                  >
                    {width.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Density</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "compact", label: "Compact", desc: "More compact spacing" },
                  { value: "comfortable", label: "Comfortable", desc: "Balanced spacing" },
                  { value: "spacious", label: "Spacious", desc: "More breathing room" },
                ].map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDensity(d.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${density === d.value
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-surface border-hairline text-muted-foreground hover:border-primary/30"
                      }`}
                  >
                    <div className="font-medium text-sm">{d.label}</div>
                    <div className="text-xs mt-1">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Visual Effects</h3>
          <div className="space-y-3">
            {[
              { label: "Glass Effect", desc: "Frosted glass panels with backdrop blur", value: glassEffect, setter: setGlassEffect },
              { label: "Transparency", desc: "Transparent panel backgrounds", value: transparency, setter: setTransparency },
            ].map((option) => (
              <div key={option.label} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-hairline">
                <div>
                  <div className="font-medium text-white text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                </div>
                <button
                  onClick={() => option.setter(!option.value)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${option.value ? "bg-primary" : "bg-surface-elevated"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${option.value ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">Rounded Corners</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: "0", label: "None" },
              { value: "8", label: "Small" },
              { value: "16", label: "Default" },
              { value: "24", label: "Large" },
            ].map((corner) => (
              <button
                key={corner.value}
                onClick={() => setRoundedCorners(corner.value)}
                className={`p-3 rounded-lg border transition-colors text-sm ${roundedCorners === corner.value
                    ? "bg-primary/20 border-primary text-white"
                    : "bg-surface border-hairline text-muted-foreground hover:border-primary/30"
                  }`}
              >
                <div className="font-medium">{corner.label}</div>
                <div className="text-xs mt-1">({corner.value}px)</div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-hairline">
          <button
            onClick={saveSettings}
            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Layout size={16} /> Save Layout Settings
          </button>
        </div>
      </div>
    </div>
  );
}
