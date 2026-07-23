"use client";

import { useState } from "react";
import { Accessibility, Eye, Volume2, MousePointer, Keyboard, Monitor, Contrast } from "lucide-react";

const Toggle = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div>
      <p className="text-sm text-white font-medium">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </div>
    <button onClick={onChange} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-[#d8b36a]" : "bg-white/10"}`}>
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  </div>
);

export default function AccessibilityPage() {
  const [settings, setSettings] = useState({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    focusIndicators: true,
    keyboardNav: true,
    captions: false,
    autoPlay: false,
    colorBlind: "none",
    fontSize: "14",
  });

  const toggle = (key: string) => setSettings((s) => ({ ...s, [key]: !s[key as keyof typeof s] }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Accessibility</h1>
        <p className="text-sm text-muted-foreground">Make the dashboard work better for you</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-4">
          <Eye size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Visual</h3>
        </div>
        <Toggle label="Reduce Motion" desc="Minimize animations and transitions throughout the UI" checked={settings.reduceMotion} onChange={() => toggle("reduceMotion")} />
        <Toggle label="High Contrast" desc="Increase contrast for better readability" checked={settings.highContrast} onChange={() => toggle("highContrast")} />
        <Toggle label="Large Text" desc="Use larger font sizes across the interface" checked={settings.largeText} onChange={() => toggle("largeText")} />
        <Toggle label="Focus Indicators" desc="Show visible focus outlines when navigating with keyboard" checked={settings.focusIndicators} onChange={() => toggle("focusIndicators")} />

        <div className="mt-4">
          <p className="text-sm text-white font-medium mb-2">Color Blind Mode</p>
          <div className="flex gap-2">
            {["none", "protanopia", "deuteranopia", "tritanopia"].map((mode) => (
              <button key={mode} onClick={() => setSettings((s) => ({ ...s, colorBlind: mode }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${settings.colorBlind === mode ? "bg-[#d8b36a] text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                {mode === "none" ? "None" : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-4">
          <Keyboard size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Keyboard & Navigation</h3>
        </div>
        <Toggle label="Keyboard Navigation" desc="Navigate the entire interface using only the keyboard" checked={settings.keyboardNav} onChange={() => toggle("keyboardNav")} />
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-4">
          <Volume2 size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Audio & Video</h3>
        </div>
        <Toggle label="Captions" desc="Show captions for video content when available" checked={settings.captions} onChange={() => toggle("captions")} />
        <Toggle label="Auto-play Media" desc="Automatically play videos and animations" checked={settings.autoPlay} onChange={() => toggle("autoPlay")} />
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary px-6 py-2 text-sm">Save Preferences</button>
      </div>
    </div>
  );
}
