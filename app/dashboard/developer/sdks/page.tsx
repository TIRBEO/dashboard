"use client";

import { Package, Copy } from "lucide-react";
import { useState } from "react";
import { PageContainer, PageHeader, Card, Badge, CodeBlock } from "../../components";

const SDKS = [
  { name: "JavaScript / TypeScript", pkg: "@tirbeo/sdk", install: "npm install @tirbeo/sdk", version: "1.2.0" },
  { name: "Python", pkg: "tirbeo-sdk", install: "pip install tirbeo-sdk", version: "1.1.0" },
  { name: "Go", pkg: "github.com/tirbeo/go-sdk", install: "go get github.com/tirbeo/go-sdk", version: "0.9.0" },
  { name: "Ruby", pkg: "tirbeo", install: "gem install tirbeo", version: "0.8.0" },
  { name: "PHP", pkg: "tirbeo/sdk-php", install: "composer require tirbeo/sdk-php", version: "0.7.0" },
];

export default function SdksPage() {
  return (
    <PageContainer>
      <PageHeader title="SDKs" description="Official client libraries for every platform" />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {SDKS.map((sdk) => (
          <Card key={sdk.name}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Package size={18} style={{ color: "var(--gold)" }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{sdk.name}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{sdk.pkg}</p>
                </div>
              </div>
              <Badge variant="gold">v{sdk.version}</Badge>
            </div>
            <CodeBlock code={sdk.install} language="bash" />
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
