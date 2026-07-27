import { useI18n } from '../../../lib/i18n';
import { useSiteConfig, bi } from '../../../lib/useSiteConfig';

export const Testimonials = () => {
  const { lang } = useI18n();
  const cfg = useSiteConfig();

  const chip = (t: (typeof cfg.testimonials.items)[number], k: string) => (
    <div key={k} className="shrink-0 w-[clamp(280px,32vw,360px)] rounded-[1.6rem] border border-[#FFFFFF]/12 bg-[#0c0c0c]/40 px-7 py-6 shadow-[0_24px_60px_-30px_rgba(216,216,224,0.45)]">
      <p className="text-[15px] text-[#FFFFFF]/85 leading-[1.6]">"{bi(t.quote, lang)}"</p>
      <div className="mt-4 flex items-center gap-3">
        <img src={t.avatar} alt={t.name} loading="lazy" className="w-9 h-9 rounded-full object-cover border border-[#FFFFFF]/15" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#FFFFFF]">{t.name}</span>
          <span className="text-xs text-[#FFFFFF]/50">{t.role}</span>
        </div>
      </div>
    </div>
  );

  return (
    <section id="community" className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-36">
      <div className="text-center mb-14">
        <h2 className="silver-heading font-black uppercase leading-[0.95] tracking-tight text-[clamp(2rem,6vw,72px)]">{bi(cfg.testimonials.heading, lang)}</h2>
        <p className="mt-5 text-[#FFFFFF]/50 text-sm md:text-base">{bi(cfg.testimonials.sub, lang)}</p>
      </div>

      <div className="marquee-wrap flex flex-col gap-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="overflow-hidden">
          <div className="marquee-row flex gap-6 w-max animate-[marquee_60s_linear_infinite]">
            {[...cfg.testimonials.items, ...cfg.testimonials.items, ...cfg.testimonials.items].map((t, i) => chip(t, `r1-${i}`))}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="marquee-row flex gap-6 w-max animate-[marquee-rev_42s_linear_infinite]">
            {[...[...cfg.testimonials.items].reverse(), ...[...cfg.testimonials.items].reverse(), ...[...cfg.testimonials.items].reverse()].map((t, i) => chip(t, `r2-${i}`))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
