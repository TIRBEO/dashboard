import { useReveal } from '../../../lib/useReveal';
import { useI18n } from '../../../lib/i18n';
import { useSiteConfig, bi } from '../../../lib/useSiteConfig';
import { AnimatedText } from '../../others/AnimatedText';

export const AboutSection = () => {
  const ref = useReveal<HTMLElement>();
  const { lang } = useI18n();
  const cfg = useSiteConfig();

  return (
    <section id="about" ref={ref} className="relative z-10 border-t border-[#FFFFFF]/10 py-24 md:py-40 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-12">
          <div className="reveal text-xs uppercase tracking-[0.25em] text-[#FFFFFF]/40">{bi(cfg.about.eyebrow, lang)}</div>
          <div className="reveal flex items-center gap-3 text-[#FFFFFF]/40">
            <span className="w-8 h-px bg-[#FFFFFF]/40" />
            <span className="text-xs uppercase tracking-[0.25em]">{bi(cfg.about.scroll, lang)}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 md:gap-20 items-start">
          <div className="md:sticky md:top-28">
            <h2 className="reveal silver-heading font-black uppercase leading-[0.92] tracking-tight text-[clamp(2.8rem,8vw,110px)]">
              {bi(cfg.about.heading, lang)}
            </h2>
            <div className="reveal mt-8 h-px w-full bg-gradient-to-r from-[#FFFFFF]/30 to-transparent" />
            <p className="reveal mt-8 text-sm text-[#FFFFFF]/45 leading-[1.8] max-w-sm">
              {bi(cfg.about.mission, lang)}
            </p>
          </div>

          <div className="space-y-8 md:space-y-9 text-[15px] md:text-base text-[#FFFFFF]/60 leading-[2]">
            {cfg.about.paragraphs.map((p, i) => (
              <AnimatedText key={i} text={bi(p, lang)} delay={i} className="block" />
            ))}
            <AnimatedText text={bi(cfg.about.mission, lang)} delay={cfg.about.paragraphs.length} className="block text-[#FFFFFF]/85 font-medium" />
          </div>
        </div>
      </div>
    </section>
  );
};
