"use client";

import { Package, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";

const SDKS = [
  { name: "JavaScript / TypeScript", pkg: "@tirbeo/sdk", install: "npm install @tirbeo/sdk", version: "1.2.0", lang: "js" },
  { name: "Python", pkg: "tirbeo-sdk", install: "pip install tirbeo-sdk", version: "1.1.0", lang: "py" },
  { name: "Go", pkg: "github.com/tirbeo/go-sdk", install: "go get github.com/tirbeo/go-sdk", version: "0.9.0", lang: "go" },
  { name: "Ruby", pkg: "tirbeo", install: "gem install tirbeo", version: "0.8.0", lang: "rb" },
  { name: "PHP", pkg: "tirbeo/sdk-php", install: "composer require tirbeo/sdk-php", version: "0.7.0", lang: "php" },
];

export default function SdksPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">SDKs</h1>
        <p className="text-sm text-muted-foreground">Official client libraries for every platform</p>
      </div>

      <div className="space-y-3">
        {SDKS.map((sdk) => (
          <div key={sdk.lang} className="glass card-section">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package size={18} className="text-[#d8b36a]" />
                <div>
                  <p className="text-sm font-medium text-white">{sdk.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{sdk.pkg} v{sdk.version}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#d8b36a]/15 text-[#d8b36a]">v{sdk.version}</span>
            </div>
            <div className="mt-3 p-2.5 rounded-lg bg-black/40 flex items-center justify-between">
              <code className="text-xs font-mono text-[#59d499]">{sdk.install}</code>
              <button onClick={() => copy(sdk.install)} className="text-muted-foreground hover:text-white">
                {copied === sdk.install ? <span className="text-[10px] text-[#59d499]">Copied</span> : <Copy size={11} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
