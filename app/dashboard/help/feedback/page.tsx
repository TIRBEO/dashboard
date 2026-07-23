"use client";

import { useState } from "react";
import { MessageCircle, Send, Star } from "lucide-react";

export default function FeedbackPage() {
  const [form, setForm] = useState({ type: "bug", rating: 0, message: "" });
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!form.message) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Feedback</h1>
        <p className="text-sm text-muted-foreground">Share your thoughts, report bugs, or suggest features</p>
      </div>

      <div className="glass card-section space-y-4">
        <div>
          <p className="text-sm text-white font-medium mb-2">Type</p>
          <div className="flex gap-2">
            {["bug", "feature", "improvement", "other"].map((t) => (
              <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${form.type === t ? "bg-[#d8b36a] text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-white font-medium mb-2">Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setForm((f) => ({ ...f, rating: n }))}>
                <Star size={20} className={n <= form.rating ? "text-[#d8b36a] fill-[#d8b36a]" : "text-white/10"} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-white font-medium mb-2">Your Feedback</p>
          <textarea placeholder="Tell us what you think..." value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white h-32 resize-none" />
        </div>

        <div className="flex justify-end">
          <button onClick={submit} className="btn btn-primary text-xs flex items-center gap-2">
            {submitted ? "Thank you!" : <><Send size={12} /> Submit Feedback</>}
          </button>
        </div>
      </div>
    </div>
  );
}
