"use client";

import { Terminal, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

const COMMANDS = [
  { cmd: "npx @tirbeo/cli login", desc: "Authenticate with your Tirbeo account" },
  { cmd: "npx @tirbeo/cli workspace list", desc: "List all your workspaces" },
  { cmd: "npx @tirbeo/cli workspace create --name <name>", desc: "Create a new workspace" },
  { cmd: "npx @tirbeo/cli member list --workspace <id>", desc: "List workspace members" },
  { cmd: "npx @tirbeo/cli member invite --email <email>", desc: "Invite a member by email" },
  { cmd: "npx @tirbeo/cli config set --key <key> --value <value>", desc: "Update workspace settings" },
  { cmd: "npx @tirbeo/cli logs --workspace <id> --limit 50", desc: "View recent activity logs" },
];

export default function CliPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">CLI</h1>
        <p className="text-sm text-muted-foreground">Manage your workspace from the command line</p>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={16} className="text-[#d8b36a]" />
          <h3 className="text-sm font-semibold text-white">Quick Install</h3>
        </div>
        <div className="p-3 rounded-lg bg-black/40 font-mono text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#59d499]">$ npx @tirbeo/cli --version</span>
            <button onClick={() => copy("npx @tirbeo/cli --version")} className="text-muted-foreground hover:text-white">
              {copied === "npx @tirbeo/cli --version" ? <span className="text-xs text-[#59d499]">Copied!</span> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </div>

      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-4">Available Commands</h3>
        <div className="space-y-2">
          {COMMANDS.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <div>
                <code className="text-xs font-mono text-[#d8b36a]">{c.cmd}</code>
                <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
              </div>
              <button onClick={() => copy(c.cmd)} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-muted-foreground">
                {copied === c.cmd ? <span className="text-[10px] text-[#59d499]">Copied</span> : <Copy size={12} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-2">Documentation</h3>
        <p className="text-xs text-muted-foreground mb-3">Read the full CLI documentation for advanced usage and configuration.</p>
        <a href="#" className="inline-flex items-center gap-1.5 text-xs text-[#d8b36a] hover:underline">View Docs <ExternalLink size={11} /></a>
      </div>
    </div>
  );
}
