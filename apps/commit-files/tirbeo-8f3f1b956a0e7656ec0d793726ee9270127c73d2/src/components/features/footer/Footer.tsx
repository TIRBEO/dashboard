import { Twitter, Send, Github } from 'lucide-react';
import { useI18n } from '../../../lib/i18n';
import { useSiteConfig, bi } from '../../../lib/useSiteConfig';

const footerIconMap: Record<string, JSX.Element> = {
  Twitter: <Twitter className="w-3.5 h-3.5" />,
  Send: <Send className="w-3.5 h-3.5" />,
  Github: <Github className="w-3.5 h-3.5" />,
};

export const Footer = () => {
  const { lang } = useI18n();
  const cfg = useSiteConfig();

  return (
    <>
      {/* Footer */}
      <footer className="relative z-10 border-t border-[#FFFFFF]/10">
        {/* Big tagline */}
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-10 border-b border-[#FFFFFF]/10">
          <h3 className="silver-heading font-black uppercase leading-[0.95] tracking-tight text-[clamp(2rem,6vw,72px)]">
            {bi(cfg.footer.tagline, lang)}
          </h3>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-3 gap-10">
          {cfg.footer.columns.map((col, ci) => (
            <div key={ci}>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#FFFFFF]/40 mb-5">{bi(col.title, lang)}</div>
              <ul className="flex flex-col gap-3">
                {col.links.map((l, li) => (
                  <li key={li}><a href={l.href} className="text-sm text-[#FFFFFF]/60 hover:text-[#FFFFFF] transition-colors">{bi(l.label, lang)}</a></li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#FFFFFF]/40 mb-5">Connect</div>
            <ul className="flex flex-col gap-3">
              {cfg.footer.connect.map(({ label, icon, href }) => (
                <li key={label}>
                  <a href={href} className="flex items-center gap-2 text-sm text-[#FFFFFF]/60 hover:text-[#FFFFFF] transition-colors">
                    {footerIconMap[icon] ?? <Twitter className="w-3.5 h-3.5" />} {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#FFFFFF]/[0.06] py-6">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#FFFFFF]/30">
            <div className="flex items-center gap-3">
              <img src={cfg.brand.logo} alt={cfg.brand.name} className="w-4 h-4 object-contain opacity-40" />
              <span>{bi(cfg.footer.rights, lang)}</span>
            </div>
            <div className="flex items-center gap-5">
              {cfg.footer.legal.map((l, li) => (
                <a key={li} href={l.href} className="hover:text-[#FFFFFF]/60 transition-colors">{bi(l.label, lang)}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Forced end of site: oversized TIRBEO wordmark on solid bg */}
      <section className="relative z-10 w-full overflow-hidden bg-[#0c0c0c] pointer-events-none select-none">
        <div className="w-full text-center py-16 md:py-24">
          <span className="block font-extrabold tracking-tighter text-[#FFFFFF] opacity-20 leading-[0.85]" style={{ fontSize: 'clamp(5rem, 26vw, 26rem)', transform: 'scale(1.1)' }}>
            {cfg.brand.name}
          </span>
        </div>
      </section>
    </>
  );
};
