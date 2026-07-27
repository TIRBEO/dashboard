import type { Bilingual, Locale } from '../../types';
import { bi } from '../../lib/useSiteConfig';

interface SectionHeadingProps {
  heading: Bilingual;
  sub?: Bilingual;
  lang: Locale;
  className?: string;
  id?: string;
}

export const SectionHeading = ({ heading, sub, lang, className = '', id }: SectionHeadingProps) => (
  <div id={id} className={`text-center mb-12 reveal ${className}`}>
    <h2 className="silver-heading font-black uppercase leading-[0.95] tracking-tight text-[clamp(2rem,6vw,72px)]">
      {bi(heading, lang)}
    </h2>
    {sub && (
      <p className="mt-5 text-[#FFFFFF]/50 text-sm md:text-base">{bi(sub, lang)}</p>
    )}
  </div>
);
