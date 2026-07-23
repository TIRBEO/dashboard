"use client";

import { useState } from "react";
import { Download, FileJson, FileText, FileSpreadsheet, CheckCircle } from "lucide-react";

const FORMATS = [
  { id: "json", label: "JSON", icon: FileJson, desc: "Machine-readable, complete data" },
  { id: "csv", label: "CSV", icon: FileSpreadsheet, desc: "Spreadsheet compatible" },
  { id: "markdown", label: "Markdown", icon: FileText, desc: "Human-readable format" },
];

const DATA_TYPES = [
  { id: "profile", label: "Profile Data", desc: "Name, bio, avatar, preferences" },
  { id: "workspaces", label: "Workspaces", desc: "All workspace data and settings" },
  { id: "activity", label: "Activity Logs", desc: "Login history and actions" },
  { id: "files", label: "Files & Uploads", desc: "All uploaded files" },
  { id: "messages", label: "Messages", desc: "Direct messages and conversations" },
  { id: "notifications", label: "Notifications", desc: "Notification history" },
];

export default function DataExportPage() {
  const [format, setFormat] = useState("json");
  const [selected, setSelected] = useState(["profile", "workspaces", "activity"]);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const exportData = () => {
    setExporting(true);
    setTimeout(() => { setExporting(false); setDone(true); setTimeout(() => setDone(false), 3000); }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Export Data</h1>
        <p className="text-sm text-muted-foreground">Download a copy of your Tirbeo data</p>
      </div>

      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-4">Format</h3>
        <div className="grid grid-cols-3 gap-3">
          {FORMATS.map((f) => (
            <button key={f.id} onClick={() => setFormat(f.id)}
              className={`p-4 rounded-lg text-center transition-all border ${format === f.id ? "border-[#d8b36a] bg-[#d8b36a]/10" : "border-white/5 bg-white/[0.03] hover:bg-white/[0.05]"}`}>
              <f.icon size={24} className="mx-auto mb-2" style={{ color: format === f.id ? "#d8b36a" : "#7b7e84" }} />
              <p className="text-sm font-medium text-white">{f.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-3">Data to Export</h3>
        <div className="space-y-2">
          {DATA_TYPES.map((dt) => (
            <label key={dt.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.05]">
              <input type="checkbox" checked={selected.includes(dt.id)} onChange={() => toggle(dt.id)} className="rounded border-white/20" />
              <div>
                <p className="text-sm text-white">{dt.label}</p>
                <p className="text-xs text-muted-foreground">{dt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={exportData} disabled={exporting || selected.length === 0}
          className="btn btn-primary px-6 py-2 text-sm flex items-center gap-2">
          {done ? <><CheckCircle size={14} /> Export Ready</> : exporting ? "Exporting..." : <><Download size={14} /> Export Data</>}
        </button>
      </div>
    </div>
  );
}
