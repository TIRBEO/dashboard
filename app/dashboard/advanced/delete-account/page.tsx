"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Input } from "../../components";

export default function DeleteAccountPage() {
  var [confirm, setConfirm] = useState("");
  var [step, setStep] = useState(0);

  return (
    <PageContainer>
      <PageHeader title="Delete Account" description="Permanently delete your account and all data" />

      <Card>
        <div style={{ border: "1px solid rgba(255,60,60,0.2)", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
            <AlertTriangle size={18} style={{ color: "var(--danger)", marginTop: 2 }} />
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--danger)", margin: 0 }}>This action is irreversible</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, marginTop: 4 }}>Deleting your account will permanently remove:</p>
            </div>
          </div>
          <ul style={{ marginLeft: 44, marginBottom: 24, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "Your profile and all personal data",
              "All workspaces you own (unless transferred)",
              "All uploaded files and content",
              "API keys and integrations",
              "Session history and activity logs",
            ].map(function(item, i) {
              return <li key={i} style={{ fontSize: 12, color: "var(--text-muted)" }}>{item}</li>;
            })}
          </ul>

          {step === 0 ? (
            <Button variant="danger" size="sm" onClick={function() { setStep(1); }}>
              <Trash2 size={13} /> Delete My Account
            </Button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 12, color: "var(--text)", margin: 0 }}>
                Type <span style={{ fontFamily: "monospace", color: "var(--danger)" }}>DELETE</span> to confirm:
              </p>
              <Input value={confirm} onChange={setConfirm} placeholder='Type "DELETE"' />
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="danger" size="sm" disabled={confirm !== "DELETE"} style={confirm !== "DELETE" ? { opacity: 0.3 } : {}}>
                  Confirm Deletion
                </Button>
                <Button variant="ghost" size="sm" onClick={function() { setStep(0); setConfirm(""); }}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </PageContainer>
  );
}
