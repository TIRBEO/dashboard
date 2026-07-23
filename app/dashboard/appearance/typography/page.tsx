"use client";

import { useState } from "react";
import { Type, Hash } from "lucide-react";

const FONTS = ["Inter", "System", "JetBrains Mono", "SF Pro", "Geist", "Fira Code", "IBM Plex Mono"];
const SIZES = [
  { label: "Small", value: "13" },
  { label: "Default", value: "14" },
  { label: "Large", value: "15" },
  { label: "Extra Large", value: "16" },
];
const WEIGHTS = ["300", "400", "500", "600", "700"];
const LINE_HEIGHTS = ["1.4", "1.5", "1.6", "1.7", "1.8"];
const LETTER_SPACING = ["-0.02em", "-0.01em", "0", "0.01em", "0.02em"];

export default function TypographyPage() {
  const [settings, setSettings] = useState({
    font: "Inter",
    size: "14",
    weight: "400",
    lineHeight: "1.5",
    letterSpacing: "0",
    ligatures: true,
    tabularNums: false,
    codeFont: "JetBrains Mono",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Typography</h1>
        <p className="text-sm text-muted-foreground">Customize fonts and text rendering</p>
      </div>

      {/* Preview */}
      <div className="glass card-section">
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Preview</p>
        <div style={{ fontFamily: settings.font, fontSize: settings.size + "px", fontWeight: settings.weight, lineHeight: settings.lineHeight, letterSpacing: settings.letterSpacing }}>
          <p className="text-white text-lg font-semibold mb-2">The quick brown fox jumps over the lazy dog</p>
          <p className="text-muted-foreground text-sm mb-2">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</p>
          <p className="text-muted-foreground" style={{ fontFamily: settings.codeFont }}>const greeting = "Hello, World!"; // 42 + 7 = 49</p>
        </div>
      </div>

      {/* Font Family */}
      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-4">
          <Type size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Font Family</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((font) => (
            <button key={font} onClick={() => setSettings((s) => ({ ...s, font }))}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${settings.font === font ? "bg-[#d8b36a] text-black font-medium" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
              style={{ fontFamily: font }}>
              {font}
            </button>
          ))}
        </div>

        <p className="text-sm text-white font-medium mt-4 mb-2">Code Font</p>
        <div className="flex gap-2">
          {["JetBrains Mono", "Fira Code", "IBM Plex Mono", "SF Mono"].map((font) => (
            <button key={font} onClick={() => setSettings((s) => ({ ...s, codeFont: font }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${settings.codeFont === font ? "bg-[#d8b36a] text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* Size & Weight */}
      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-4">Size & Weight</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Base Font Size</p>
            <div className="flex gap-1">
              {SIZES.map((s) => (
                <button key={s.value} onClick={() => setSettings((st) => ({ ...st, size: s.value }))}
                  className={`flex-1 px-2 py-1.5 rounded text-xs transition-all ${settings.size === s.value ? "bg-[#d8b36a] text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Font Weight</p>
            <div className="flex gap-1">
              {WEIGHTS.map((w) => (
                <button key={w} onClick={() => setSettings((s) => ({ ...s, weight: w }))}
                  className={`flex-1 px-2 py-1.5 rounded text-xs transition-all ${settings.weight === w ? "bg-[#d8b36a] text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                  style={{ fontWeight: w }}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Line Height</p>
            <div className="flex gap-1">
              {LINE_HEIGHTS.map((h) => (
                <button key={h} onClick={() => setSettings((s) => ({ ...s, lineHeight: h }))}
                  className={`flex-1 px-2 py-1.5 rounded text-xs transition-all ${settings.lineHeight === h ? "bg-[#d8b36a] text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                  {h}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Letter Spacing</p>
            <div className="flex gap-1">
              {LETTER_SPACING.map((ls) => (
                <button key={ls} onClick={() => setSettings((s) => ({ ...s, letterSpacing: ls }))}
                  className={`flex-1 px-2 py-1.5 rounded text-xs transition-all ${settings.letterSpacing === ls ? "bg-[#d8b36a] text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                  {ls}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-3">Advanced</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-white">Font Ligatures</p>
              <p className="text-xs text-muted-foreground">Enable combined character rendering (fi, fl, etc.)</p>
            </div>
            <button onClick={() => setSettings((s) => ({ ...s, ligatures: !s.ligatures }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.ligatures ? "bg-[#d8b36a]" : "bg-white/10"}`}>
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${settings.ligatures ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-white">Tabular Numbers</p>
              <p className="text-xs text-muted-foreground">Use fixed-width numbers for alignment in tables</p>
            </div>
            <button onClick={() => setSettings((s) => ({ ...s, tabularNums: !s.tabularNums }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.tabularNums ? "bg-[#d8b36a]" : "bg-white/10"}`}>
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${settings.tabularNums ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary px-6 py-2 text-sm">Save Typography</button>
      </div>
    </div>
  );
}
