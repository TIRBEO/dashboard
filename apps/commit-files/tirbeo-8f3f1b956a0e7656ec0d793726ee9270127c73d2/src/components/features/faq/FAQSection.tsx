import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useReveal } from '../../../lib/useReveal';
import { useI18n } from '../../../lib/i18n';
import { useSiteConfig, bi } from '../../../lib/useSiteConfig';

export const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useReveal<HTMLElement>();
  const { lang } = useI18n();
  const cfg = useSiteConfig();

  const faqs = cfg.faq.items.map((f) => ({ q: bi(f.q, lang), a: bi(f.a, lang) }));

  return (
    <section ref={ref} className="relative z-10 border-t border-[#FFFFFF]/10 py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="reveal silver-heading font-black uppercase text-[clamp(2.6rem,9vw,120px)] leading-[0.95] tracking-tight mb-14">
          {bi(cfg.faq.heading, lang)}
        </h2>

        <div className="reveal text-left flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div key={i} className={`rounded-2xl border transition-colors duration-300 ${open === i ? 'border-[#FFFFFF]/20 bg-[#FFFFFF]/[0.03]' : 'border-[#FFFFFF]/8 hover:border-[#FFFFFF]/15 bg-transparent'}`}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left group">
                <span className={`text-base md:text-lg font-medium transition-colors ${open === i ? 'text-[#FFFFFF]' : 'text-[#FFFFFF]/70 group-hover:text-[#FFFFFF]'}`}>
                  {faq.q}
                </span>
                <span className={`ml-4 flex items-center justify-center w-8 h-8 rounded-full border flex-shrink-0 transition-all duration-300 ${open === i ? 'border-[#FFFFFF]/25 bg-[#FFFFFF]/10 rotate-180 text-[#FFFFFF]' : 'border-[#FFFFFF]/10 text-[#FFFFFF]/40 group-hover:border-[#FFFFFF]/25 group-hover:text-[#FFFFFF]/60'}`}>
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>
              <div className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out" style={{ maxHeight: open === i ? '240px' : '0px', opacity: open === i ? 1 : 0 }}>
                <p className="px-6 pb-5 text-sm md:text-base text-[#FFFFFF]/50 leading-[1.8]">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
