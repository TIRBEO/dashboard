import { useState, useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useI18n } from '../../../lib/i18n';
import { useSiteConfig, bi } from '../../../lib/useSiteConfig';

export const Hero = ({ ready = true }: { ready?: boolean }) => {
  const [mode, setMode] = useState<'button' | 'form'>('button');
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [heroOpacity, setHeroOpacity] = useState(ready ? 1 : 0);
  const [heroY, setHeroY] = useState(ready ? 0 : 24);
  const { lang } = useI18n();
  const cfg = useSiteConfig();

  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      setHeroOpacity(e);
      setHeroY(24 * (1 - e));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  useEffect(() => {
    const target = submitted
      ? (lang === 'ne' ? cfg.hero.submittedNe : cfg.hero.submittedEn)
      : (lang === 'ne' ? cfg.hero.placeholderNe : cfg.hero.placeholderEn);
    let i = 0;
    setPlaceholder('');
    const id = setInterval(() => {
      i += 1;
      setPlaceholder(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [mode, submitted, lang, cfg]);

  useEffect(() => {
    if (mode !== 'form') return;
    const t = setTimeout(() => setMode('button'), 4000);
    return () => clearTimeout(t);
  }, [mode, submitted]);

  const openForm = () => setMode('form');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang, source: 'hero' }),
      }).catch(() => {
        window.location.href = `mailto:hello@tirbeo.app?subject=Early Access&body=${encodeURIComponent(email)}`;
      });
    } finally {
      setSubmitted(true);
    }
  };

  return (
    <section id="top" className="relative z-20 h-[100svh] flex flex-col items-center justify-center text-center px-5 pt-24 pb-20">
      <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center justify-center w-full gap-8 sm:gap-12" style={{ opacity: heroOpacity, transform: `translateY(${heroY}px)` }}>
        <div className="mt-20 sm:mt-28 w-full flex items-center justify-center text-center text-[#FFFFFF]/80 text-[10px] md:text-[11px] font-medium tracking-[0.2em] uppercase">
          {bi(cfg.hero.tagline, lang)}
        </div>

        <h1 style={{ fontFamily: "'Instrument Serif', serif" }} className="mx-auto text-center text-5xl md:text-[72px] font-normal tracking-[-0.01em] leading-[1.08] mb-6 bg-gradient-to-b from-[#FFFFFF] via-[#FFFFFF]/95 to-[#FFFFFF]/65 bg-clip-text text-transparent max-w-4xl hero-rise">
          {bi(cfg.hero.title, lang)}
        </h1>

        <div className="min-h-[50px] mt-2">
          {mode === 'button' ? (
            <button onClick={openForm} className="glass-pill px-10 py-3 text-[14px] font-medium text-[#FFFFFF] cursor-pointer">
              {bi(cfg.hero.cta, lang)}
            </button>
          ) : (
            <form onSubmit={submit} className="flex items-center gap-2 pl-5 pr-1.5 py-1.5 text-[14px] font-medium border border-[#FFFFFF]/20 rounded-full w-full max-w-[320px] focus-within:border-[#FFFFFF]/40 transition-colors duration-300">
              <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder={placeholder} className="flex-1 min-w-0 bg-transparent text-[#FFFFFF] placeholder-[#FFFFFF]/45 outline-none" />
              <button type="submit" className="flex-shrink-0 w-8 h-8 rounded-full glass-cta flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
                {submitted ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>

        <div className="mt-20 sm:mt-28 flex flex-col items-center gap-2 text-[#FFFFFF]/40 reveal">
          <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          <span className="w-5 h-8 rounded-full border border-[#FFFFFF]/25 flex items-start justify-center p-1">
            <span className="w-1 h-2 rounded-full bg-[#FFFFFF]/60 animate-bounce" />
          </span>
        </div>
      </div>
    </section>
  );
};
