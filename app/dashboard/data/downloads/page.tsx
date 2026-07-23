"use client";

import { Archive, Download, Trash2, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type DownloadEntry = {
  id: string;
  filename: string;
  size: string;
  format: string;
  status: "ready" | "processing" | "expired";
  createdAt: string;
  expiresAt: string;
};

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    setLoading(false);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Downloads</h1>
        <p className="text-sm text-muted-foreground">Your exported data and generated files</p>
      </div>

      <div className="glass card-section">
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />)}</div>
        ) : downloads.length === 0 ? (
          <div className="text-center py-12">
            <Archive size={48} className="mx-auto mb-3" style={{ color: "#7b7e84" }} />
            <p className="text-sm text-muted-foreground">No downloads yet</p>
            <p className="text-xs text-muted-foreground mt-1">Export data from the Data section to see files here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {downloads.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <Archive size={14} className="text-[#d8b36a]" />
                  <div>
                    <p className="text-sm font-medium text-white">{d.filename}</p>
                    <p className="text-xs text-muted-foreground">{d.size} · {d.format} · {d.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.status === "ready" && (
                    <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-muted-foreground"><Download size={12} /></button>
                  )}
                  <button onClick={() => setDownloads((p) => p.filter((x) => x.id !== d.id))}
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
