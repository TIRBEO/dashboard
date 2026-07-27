import { useState } from 'react';
import { useI18n } from '../../../lib/i18n';
import { useSiteConfig, bi } from '../../../lib/useSiteConfig';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { lang } = useI18n();
  const cfg = useSiteConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang, source: 'newsletter' }),
      }).catch(() => { });
    } finally {
      setSubmitted(true);
    }
  };

  return (
    <section id="newsletter" className="relative z-10 border-t border-[#FFFFFF]/10 overflow-hidden">
      <div className="relative max-w-2xl mx-auto px-6 py-28 md:py-40 text-center">
        <div className="reveal">
          <h2 className="silver-heading font-black uppercase leading-[0.95] tracking-tight text-[clamp(2rem,6vw,60px)]">
            {bi(cfg.newsletter.heading, lang)}
          </h2>
          <p className="mt-5 text-[#FFFFFF]/50 text-sm leading-[1.7]">{bi(cfg.newsletter.sub, lang)}</p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
              <input type="email" required placeholder={bi(cfg.newsletter.emailPlaceholder, lang)} value={email} onChange={e => setEmail(e.target.value)} className="flex-1 w-full rounded-full border border-[#FFFFFF]/15 text-[#FFFFFF] placeholder-[#FFFFFF]/40 text-sm px-5 py-3.5 outline-none focus:border-[#FFFFFF]/40 transition-all" />
              <button type="submit" className="w-full sm:w-auto flex-shrink-0 rounded-full glass-cta font-semibold text-sm px-7 py-3.5 transition-all active:scale-[0.98]">
                {bi(cfg.newsletter.subscribe, lang)}
              </button>
            </form>
          ) : (
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#FFFFFF]/20 text-[#FFFFFF] px-7 py-3.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-[#FFFFFF] animate-pulse" /> {bi(cfg.newsletter.subscribed, lang)}
            </div>
          )}
          <p className="mt-4 text-xs text-[#FFFFFF]/25">{bi(cfg.newsletter.spam, lang)}</p>
        </div>
      </div>
    </section>
  );
};
