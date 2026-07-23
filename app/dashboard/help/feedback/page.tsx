"use client";

import { useState } from "react";
import { Send, Star } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Textarea } from "../../components";

export default function FeedbackPage() {
  var [form, setForm] = useState({ type: "bug", rating: 0, message: "" });
  var [submitted, setSubmitted] = useState(false);

  var submit = function() {
    if (!form.message) return;
    setSubmitted(true);
    setTimeout(function() { setSubmitted(false); }, 3000);
  };

  return (
    <PageContainer>
      <PageHeader title="Feedback" description="Share your thoughts, report bugs, or suggest features" />

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>Type</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["bug", "feature", "improvement", "other"].map(function(t) {
                return (
                  <button key={t} onClick={function() { setForm(Object.assign({}, form, { type: t })); }}
                    style={{
                      padding: "6px 12px", borderRadius: 8, fontSize: 12, border: "none", cursor: "pointer",
                      background: form.type === t ? "var(--gold)" : "rgba(255,255,255,0.05)",
                      color: form.type === t ? "#000" : "var(--text-muted)",
                      fontWeight: 500, transition: "all 0.15s",
                    }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>Rating</p>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map(function(n) {
                return (
                  <button key={n} onClick={function() { setForm(Object.assign({}, form, { rating: n })); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                    <Star size={20} style={{ color: n <= form.rating ? "var(--gold)" : "rgba(255,255,255,0.1)", fill: n <= form.rating ? "var(--gold)" : "none" }} />
                  </button>
                );
              })}
            </div>
          </div>

          <Textarea label="Your Feedback" value={form.message} onChange={function(v) { setForm(Object.assign({}, form, { message: v })); }} placeholder="Tell us what you think..." />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="primary" size="sm" onClick={submit}>
              {submitted ? "Thank you!" : <><Send size={12} /> Submit Feedback</>}
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
