"use client";

import { useState } from "react";
import { Palette, Layout, Type, Accessibility, Zap, Save } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

export default function AppearanceColorsPage() {
  const [accentColor, setAccentColor] = useState("#ffffff");
  const [customColor, setCustomColor] = useState("#4f7aff");
  const [applyToAll, setApplyToAll] = useState(false);

  const predefinedColors = [
    { name: "White", value: "#ffffff" },
    { name: "Blue", value: "#4f7aff" },
    { name: "Purple", value: "#9f7aea" },
    { name: "Green", value: "#59d499" },
    { name: "Orange", value: "#ff9f43" },
    { name: "Red", value: "#ff6161" },
    { name: "Pink", value: "#f56ebf" },
    { name: "Gold", value: "#d8b36a" },
    { name: "Cyan", value: "#38bdf8" },
    { name: "Emerald", value: "#10b981" },
  ];

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
            accentColor: applyToAll ? customColor : accentColor,
            sidebarStyle: "fixed",
            density: "comfortable",
            glassEffect: true,
            transparency: false,
            roundedCorners: 12,
            fontFamily: "Inter",
            animationSpeed: "normal",
            showLabels: true,
            collapseByDefault: false,
            iconSize: 18,
          },
        }),
      });
      alert("Color settings saved!");
    } catch {
      alert("Failed to save color settings");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Color Theme</h1>
        <p className="text-muted-foreground">Choose your accent colors and theme palette</p>
      </div>

      <div className="glass card-section space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Predefined Colors</h3>
          <div className="grid grid-cols-5 gap-3">
            {predefinedColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccentColor(color.value)}
                className={`aspect-square rounded-lg transition-all ${accentColor === color.value
                    ? "ring-2 ring-white ring-offset-2 ring-offset-surface"
                    : "hover:scale-105"
                  }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Selected: <span className="text-white font-mono">{accentColor}</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Custom Color</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Accent Color</label>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-full h-10 rounded border border-hairline bg-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="apply-all"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-hairline"
              />
              <label htmlFor="apply-all" className="text-sm text-muted-foreground">
                Apply to all UI elements
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-hairline">
          <button
            onClick={saveSettings}
            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Palette size={16} /> Save Color Settings
          </button>
        </div>
      </div>

      <div className="glass card-section">
        <h3 className="text-lg font-semibold text-white mb-4">Theme Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Dark", description: "Dark theme with vibrant accent", theme: "dark" },
            { name: "Light", description: "Light theme with modern palette", theme: "light" },
            { name: "System", description: "Follow OS theme preference", theme: "system" },
          ].map((theme) => (
            <div key={theme.name} className="p-4 rounded-lg border border-hairline hover:border-primary/30 transition-colors cursor-pointer">
              <div className="font-medium text-white mb-2">{theme.name}</div>
              <div className="text-xs text-muted-foreground">{theme.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
