"use client";

import { GraduationCap, Play, Clock } from "lucide-react";

const TUTORIALS = [
  { title: "Setting Up Your First Workspace", duration: "5 min", level: "Beginner", icon: "1" },
  { title: "Managing Team Members", duration: "8 min", level: "Beginner", icon: "2" },
  { title: "Configuring SSO Authentication", duration: "12 min", level: "Intermediate", icon: "3" },
  { title: "Building with the Tirbeo API", duration: "15 min", level: "Advanced", icon: "4" },
  { title: "Setting Up Webhooks", duration: "10 min", level: "Intermediate", icon: "5" },
  { title: "Customizing Your Dashboard", duration: "6 min", level: "Beginner", icon: "6" },
];

export default function TutorialsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Tutorials</h1>
        <p className="text-sm text-muted-foreground">Step-by-step guides to get the most out of Tirbeo</p>
      </div>

      <div className="space-y-3">
        {TUTORIALS.map((t, i) => (
          <div key={i} className="glass card-section flex items-center gap-4 cursor-pointer hover:bg-white/[0.04] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#d8b36a]/15 flex items-center justify-center text-[#d8b36a] text-sm font-bold shrink-0">
              {t.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{t.title}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} /> {t.duration}</span>
                <span className="text-xs text-muted-foreground">{t.level}</span>
              </div>
            </div>
            <Play size={14} className="text-[#d8b36a]" />
          </div>
        ))}
      </div>
    </div>
  );
}
