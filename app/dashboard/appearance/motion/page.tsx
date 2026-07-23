"use client";

import { useState } from "react";
import { Zap, Play, Pause, RotateCcw } from "lucide-react";

const SPEEDS = [
  { label: "Instant", value: "instant", ms: "0ms", desc: "No animations" },
  { label: "Fast", value: "fast", ms: "100ms", desc: "Quick, snappy feel" },
  { label: "Normal", value: "normal", ms: "200ms", desc: "Balanced default" },
  { label: "Slow", value: "slow", ms: "400ms", desc: "Smooth, deliberate" },
];

const EASINGS = [
  { label: "Ease", value: "ease" },
  { label: "Ease In Out", value: "ease-in-out" },
  { label: "Linear", value: "linear" },
  { label: "Spring", value: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
];

export default function MotionPage() {
  const [settings, setSettings] = useState({
    speed: "normal",
    easing: "ease-in-out",
    reduceMotion: false,
    pageTransitions: true,
    hoverEffects: true,
    scrollAnimations: true,
    loadingSpinners: true,
    focusAnimations: true,
    previewPlaying: false,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Motion</h1>
        <p className="text-sm text-muted-foreground">Control animations and transitions</p>
      </div>

      {/* Preview */}
      <div className="glass card-section">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Preview</p>
          <div className="flex gap-1">
            <button onClick={() => setSettings((s) => ({ ...s, previewPlaying: true }))}
              className={`p-1.5 rounded ${settings.previewPlaying ? "bg-[#d8b36a] text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
              <Play size={12} />
            </button>
            <button onClick={() => setSettings((s) => ({ ...s, previewPlaying: false }))}
              className={`p-1.5 rounded ${!settings.previewPlaying ? "bg-white/10 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
              <Pause size={12} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center py-8 bg-white/[0.02] rounded-lg">
          <div
            className="w-12 h-12 bg-[#d8b36a] rounded-xl"
            style={{
              transition: settings.reduceMotion ? "none" : `all ${SPEEDS.find(s => s.value === settings.speed)?.ms || "200ms"} ${settings.easing}`,
              transform: settings.previewPlaying ? "rotate(180deg) scale(1.2)" : "rotate(0deg) scale(1)",
            }}
          />
        </div>
      </div>

      {/* Speed */}
      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Animation Speed</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SPEEDS.map((speed) => (
            <button key={speed.value} onClick={() => setSettings((s) => ({ ...s, speed: speed.value }))}
              className={`px-3 py-3 rounded-lg text-center transition-all ${settings.speed === speed.value ? "bg-[#d8b36a] text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
              <p className="text-sm font-medium">{speed.label}</p>
              <p className="text-[10px] opacity-70">{speed.ms}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Easing */}
      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-3">Easing Curve</h3>
        <div className="grid grid-cols-2 gap-2">
          {EASINGS.map((easing) => (
            <button key={easing.value} onClick={() => setSettings((s) => ({ ...s, easing: easing.value }))}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${settings.easing === easing.value ? "bg-[#d8b36a] text-black font-medium" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
              {easing.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-3">Animation Types</h3>
        {[
          { key: "reduceMotion", label: "Reduce All Motion", desc: "Disable every animation globally" },
          { key: "pageTransitions", label: "Page Transitions", desc: "Animate between page navigations" },
          { key: "hoverEffects", label: "Hover Effects", desc: "Scale and glow on interactive elements" },
          { key: "scrollAnimations", label: "Scroll Animations", desc: "Animate elements as they enter viewport" },
          { key: "loadingSpinners", label: "Loading Spinners", desc: "Animated loading indicators" },
          { key: "focusAnimations", label: "Focus Animations", desc: "Highlight focused elements with animation" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
            <div>
              <p className="text-sm text-white">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <button onClick={() => setSettings((s) => ({ ...s, [item.key]: !s[item.key as keyof typeof s] }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? "bg-[#d8b36a]" : "bg-white/10"}`}>
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${settings[item.key as keyof typeof settings] ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary px-6 py-2 text-sm">Save Motion Settings</button>
      </div>
    </div>
  );
}
