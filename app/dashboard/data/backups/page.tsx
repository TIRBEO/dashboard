"use client";

import { Database, Plus, Download, Trash2, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

type Backup = {
  id: string;
  name: string;
  size: string;
  status: "complete" | "in_progress" | "failed";
  createdAt: string;
  includes: string[];
};

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);

  const createBackup = () => {
    const b: Backup = {
      id: Date.now().toString(),
      name: "Manual Backup " + new Date().toLocaleDateString(),
      size: "Calculating...",
      status: "in_progress",
      createdAt: new Date().toISOString(),
      includes: ["profile", "workspaces", "files"],
    };
    setBackups((prev) => [b, ...prev]);
    setTimeout(() => {
      setBackups((prev) => prev.map((x) => x.id === b.id ? { ...x, size: "12.4 MB", status: "complete" as const } : x));
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Backups</h1>
          <p className="text-sm text-muted-foreground">Create and manage account backups</p>
        </div>
        <button onClick={createBackup} className="btn btn-primary text-xs"><Plus size={13} /> Create Backup</button>
      </div>

      <div className="glass card-section">
        {backups.length === 0 ? (
          <div className="text-center py-12">
            <Database size={48} className="mx-auto mb-3" style={{ color: "#7b7e84" }} />
            <p className="text-sm text-muted-foreground">No backups created</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  {b.status === "complete" ? <CheckCircle size={14} className="text-[#59d499]" /> :
                   b.status === "in_progress" ? <Clock size={14} className="text-[#d8b36a] animate-spin" /> :
                   <Database size={14} className="text-red-400" />}
                  <div>
                    <p className="text-sm font-medium text-white">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.size} · {b.includes.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.status === "complete" && <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-muted-foreground"><Download size={12} /></button>}
                  <button onClick={() => setBackups((p) => p.filter((x) => x.id !== b.id))}
                    className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
