"use client";

import { useState } from "react";
import { Palette, Layout, Type, Accessibility, Zap, Save } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

export default function AppearanceSidebarPage() {
  const [sidebarStyle, setSidebarStyle] = useState("fixed");
  const [sidebarWidth, setSidebarWidth] = useState("wide");
  const [showLabels, setShowLabels] = useState(true);
  const [collapseByDefault, setCollapseByDefault] = useState(false);
  const [iconSize, setIconSize] = useState(18);

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
            density: "comfortable",
            glassEffect: true,
            transparency: false,
            roundedCorners: 12,
            fontFamily: "Inter",
            animationSpeed: "normal",
            showLabels,
            collapseByDefault,
            iconSize,
          },
        }),
      });
      alert("Sidebar settings saved!");
    } catch {
      alert("Failed to save sidebar settings");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Sidebar Settings</h1>
        <p className="text-muted-foreground">Customize your sidebar layout and behavior</p>
      </div>

      <div className="glass card-section space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Layout Options</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Sidebar Style</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "fixed", label: "Fixed", desc: "Sticky sidebar" },
                  { value: "floating", label: "Floating", desc: "Hover to show" },
                  { value: "compact", label: "Compact", desc: "Minimal sidebar" },
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
                    className={`px-4 py-2 rounded-lg border transition-colors text-sm ${sidebarStyle === width.value
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
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Icon Size</label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">Small</span>
                <input
                  type="range"
                  min="14"
                  max="24"
                  value={iconSize}
                  onChange={(e) => setIconSize(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">Large</span>
                <span className="text-sm font-medium text-white w-8 text-center">{iconSize}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Visibility Options</h3>
          <div className="space-y-3">
            {[
              { label: "Show Labels", desc: "Display text labels next to icons", value: showLabels, setter: setShowLabels },
              { label: "Collapse by Default", desc: "Start with sidebar collapsed", value: collapseByDefault, setter: setCollapseByDefault },
            ].map((option) => (
              <div key={option.label} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-hairline">
                <div>
                  <div className="font-medium text-white text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                </div>
                <button
                  onClick={() => option.setter(!option.value)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${option.value ? "bg-primary" : "bg-surface-elevated"}
                  `}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${option.value ? "right-1" : "left-1"}
                  `}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-hairline">
          <button
            onClick={saveSettings}
            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save Sidebar Settings
          </button>
        </div>
      </div>
    </div>
  );
}