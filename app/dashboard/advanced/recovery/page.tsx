"use client";

import { useState } from "react";
import { Key, LifeBuoy, Download } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Input } from "../../components";

export default function RecoveryPage() {
  var [codes] = useState(["a1b2-c3d4", "e5f6-g7h8", "i9j0-k1l2", "m3n4-o5p6", "q7r8-s9t0"]);
  var [copied, setCopied] = useState(false);
  var [recoveryEmail, setRecoveryEmail] = useState("");

  var copyCodes = function() {
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  };

  return (
    <PageContainer>
      <PageHeader title="Account Recovery" description="Recovery options in case you lose access" />

      <Card title="Backup Codes" subtitle="Use these one-time codes to sign in if you lose access to your 2FA device. Each code can only be used once."
        action={<Key size={14} style={{ color: "var(--gold)" }} />}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 16 }}>
          {codes.map(function(c) {
            return (
              <div key={c} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.4)", fontFamily: "monospace", fontSize: 13, color: "var(--gold)", textAlign: "center", border: "1px solid var(--border)" }}>
                {c}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={copyCodes}>{copied ? "Copied!" : "Copy Codes"}</Button>
          <Button variant="ghost" size="sm"><Download size={12} /> Download</Button>
        </div>
      </Card>

      <Card title="Recovery Email" subtitle="Set a recovery email to reset your password if locked out."
        action={<LifeBuoy size={14} style={{ color: "var(--gold)" }} />}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input type="email" value={recoveryEmail} onChange={setRecoveryEmail} placeholder="recovery@example.com" />
          <div>
            <Button variant="primary" size="sm">Save Recovery Email</Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
