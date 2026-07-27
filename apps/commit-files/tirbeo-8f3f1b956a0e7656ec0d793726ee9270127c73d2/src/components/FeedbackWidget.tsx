import { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useI18n } from '../lib/i18n';

export const FeedbackWidget = () => {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // offset from bottom-right
  const [msg, setMsg] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const rootRef = useRef<HTMLDivElement>(null);

  // Start pinned to the bottom-right; never overlap the scrollbar.
  useEffect(() => {
    setPos({ x: 20, y: 20 });
  }, []);

  // Clamp position inside the viewport.
  const clamp = (x: number, y: number) => {
    const w = rootRef.current?.offsetWidth ?? 56;
    const h = rootRef.current?.offsetHeight ?? 56;
    const maxX = Math.max(8, window.innerWidth - w - 8);
    const maxY = Math.max(8, window.innerHeight - h - 8);
    return {
      x: Math.min(Math.max(8, x), maxX),
      y: Math.min(Math.max(8, y), maxY),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const nx = start.current.px - (e.clientX - start.current.x);
    const ny = start.current.py - (e.clientY - start.current.y);
    setPos(clamp(nx, ny));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, email, lang }),
      }).catch(() => {
        window.location.href = `mailto:hello@tirbeo.app?subject=Feedback&body=${encodeURIComponent(msg + (email ? `\n\nFrom: ${email}` : ''))}`;
      });
    } finally {
      setLoading(false);
      setSent(true);
      setMsg('');
      setEmail('');
      setTimeout(() => setSent(false), 4000);
    }
  };

  const label = lang === 'ne' ? 'प्रतिक्रिया' : 'Feedback';

  return (
    <div
      ref={rootRef}
      className="fixed z-[80] select-none"
      style={{ right: pos.x, bottom: pos.y }}
    >
      {open ? (
        <div
          className="glass-card w-[300px] max-w-[88vw] rounded-[22px] p-4 flex flex-col gap-3"
          style={{ touchAction: 'none' }}
        >
          <div
            className="flex items-center justify-between cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-[#FFFFFF]">
              <MessageSquare className="w-4 h-4" /> {label}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#FFFFFF]/60 hover:text-[#FFFFFF] transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {sent ? (
            <div className="flex items-center gap-2 text-sm text-[#FFFFFF] px-1 py-2">
              <Send className="w-4 h-4" /> {lang === 'ne' ? 'धन्यवाद!' : 'Thanks for the feedback!'}
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-2">
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
                rows={3}
                placeholder={lang === 'ne' ? 'तपाईंको विचार...' : 'Share your thoughts…'}
                className="w-full resize-none rounded-2xl border border-[#FFFFFF]/12 px-3 py-2.5 text-sm text-[#FFFFFF] placeholder-[#FFFFFF]/35 outline-none focus:border-[#FFFFFF]/35 transition-all"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === 'ne' ? 'इमेल (वैकल्पिक)' : 'Email (optional)'}
                className="w-full rounded-full border border-[#FFFFFF]/12 px-4 py-2 text-sm text-[#FFFFFF] placeholder-[#FFFFFF]/35 outline-none focus:border-[#FFFFFF]/35 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="glass-cta text-sm font-semibold py-2.5 disabled:opacity-60"
              >
                {loading ? '…' : (lang === 'ne' ? 'पठाउनुहोस्' : 'Send')}
              </button>
            </form>
          )}
        </div>
      ) : (
        <button
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={() => setOpen(true)}
          className="glass-cta w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.45)] cursor-grab active:cursor-grabbing"
          aria-label={label}
          title={label}
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
