"use client";

import { Cloud, HardDrive, Database } from "lucide-react";

export default function DataStoragePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Connected Storage</h1>
        <p className="text-sm text-muted-foreground">Manage external storage providers</p>
      </div>

      <div className="glass card-section">
        <div className="text-center py-12">
          <Cloud size={48} className="mx-auto mb-3" style={{ color: "#7b7e84" }} />
          <p className="text-sm text-muted-foreground mb-1">No storage providers connected</p>
          <p className="text-xs text-muted-foreground mb-4">Connect S3, Google Cloud Storage, or other providers</p>
          <button className="btn btn-primary text-xs">Connect Storage Provider</button>
        </div>
      </div>
    </div>
  );
}
