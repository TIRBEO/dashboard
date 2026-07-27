import { useState, useEffect } from 'react';
import { Menu, ChevronDown, Check } from 'lucide-react';
import { scrollToId } from '../../../lib/smoothScroll';
import { useI18n } from '../../../lib/i18n';
import { useSiteConfig, bi } from '../../../lib/useSiteConfig';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [eaEmail, setEaEmail] = useState('');
  const [eaDone, setEaDone] = useState(false);
  const [eaLoading, setEaLoading] = useState(false);
  const { lang, setLang } = useI18n();
  const cfg = useSiteConfig();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setScrolled(y > 24);
      setHidden(y > window.innerHeight * 0.85);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onDocClick = () => setOpenMenu(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const toggleLang = () => setLang(lang === 'en' ? 'ne' : 'en');

  const submitEarlyAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eaEmail) return;
    setEaLoading(true);
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: eaEmail, lang }),
      }).catch(() => {
        window.location.href = `mailto:hello@tirbeo.app?subject=Early Access&body=${encodeURIComponent(eaEmail)}`;
      });
    } finally {
      setEaLoading(false);
      setEaDone(true);
    }
  };

  const renderLink = (link: ReturnType<typeof useSiteConfig>['navbar']['links'][number], inMobile = false) => {
    if (link.dropdown) {
      return (
        <div key={link.key} className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setOpenMenu(openMenu === link.key ? null : link.key)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:text-[#FFFFFF] transition-all duration-200"
          >
            {bi(link.label, lang)}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openMenu === link.key ? 'rotate-180' : ''}`} />
          </button>
          {openMenu === link.key && (
            <div className={`${inMobile ? '' : 'absolute left-0 top-full pt-3 w-60'}`}>
              <div className="glass-card rounded-2xl p-2 flex flex-col gap-1">
                {link.dropdown.map((item, di) => (
                  <a
                    key={di}
                    href={item.href}
                    target={item.href.startsWith('#') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="flex flex-col px-3 py-2 rounded-xl hover:text-[#FFFFFF] transition-all"
                  >
                    <span className="text-sm font-medium text-[#FFFFFF]">{bi(item.label, lang)}</span>
                    {item.desc && <span className="text-xs text-[#FFFFFF]/50">{bi(item.desc, lang)}</span>}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    const onClick = link.target ? (() => { setMobileOpen(false); scrollToId(link.target!); }) : undefined;
    return (
      <a
        key={link.key}
        href={link.href || (link.target ? `#${link.target}` : '#')}
        target={link.href && !link.href.startsWith('#') ? '_blank' : undefined}
        rel="noopener noreferrer"
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full hover:text-[#FFFFFF] transition-all duration-200 ${inMobile ? 'block w-full text-left' : ''}`}
      >
        {bi(link.label, lang)}
      </a>
    );
  };

  return (
    <nav
      className="absolute top-0 inset-x-0 z-50 transition-[transform,opacity] duration-500 ease-out"
      style={{ transform: hidden ? 'translateY(-120px)' : 'translateY(0)', opacity: hidden ? 0 : 1 }}
    >
      <div className={`mx-auto max-w-5xl px-4 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
        <div className={`liquid-glass rounded-full px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-black/40' : ''}`}>
          {/* Left: logo + nav links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a href={cfg.brand.logoHref} target={cfg.brand.logoHref.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" onClick={(e) => { if (!cfg.brand.logoHref.startsWith('http')) { e.preventDefault(); setMobileOpen(false); scrollToId('top'); } }} className="flex items-center gap-2 group">
              <img src={cfg.brand.logo} alt={cfg.brand.name} className="w-12 h-12 rounded-full object-cover transition-transform duration-500 group-hover:rotate-[18deg]" />
              <span className="hidden sm:inline text-[#FFFFFF] font-semibold text-lg tracking-tight">{cfg.brand.name}</span>
            </a>

            <div className="hidden md:flex items-center gap-1 text-[#FFFFFF]/75 text-sm font-medium ml-2 md:ml-4">
              {cfg.navbar.links.map((link) => renderLink(link))}
            </div>
          </div>

          {/* Right: signup/login + language + menu */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex items-center gap-0.5 md:gap-1">
              <a href={cfg.navbar.signup.href} target="_blank" rel="noopener noreferrer" className="glass-pill no-border px-2.5 md:px-4 py-1 md:py-1.5 text-sm font-medium text-[#FFFFFF] cursor-pointer">
                {bi(cfg.navbar.signup.label, lang)}
              </a>
              <a href={cfg.navbar.login.href} target="_blank" rel="noopener noreferrer" className="glass-pill px-2.5 md:px-4 py-1 md:py-1.5 text-sm font-medium text-[#FFFFFF] cursor-pointer">
                {bi(cfg.navbar.login.label, lang)}
              </a>
            </div>

            <button onClick={toggleLang} className="glass-pill flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#FFFFFF] cursor-pointer" aria-label="Toggle language">
              <img src={lang === 'en' ? cfg.flags.en : cfg.flags.ne} alt="" className="w-5 h-5 rounded-full object-cover border border-[#FFFFFF]/20" />
              <span className="hidden sm:inline">{lang === 'en' ? 'EN' : 'नेपाली'}</span>
            </button>

            <button onClick={() => setMobileOpen((v) => !v)} className="sm:hidden w-10 h-10 rounded-full border border-[#FFFFFF]/10 flex items-center justify-center text-[#FFFFFF]" aria-label="Toggle menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile dropdown panel */}
        {mobileOpen && (
          <div className="sm:hidden px-2 pb-4" onClick={(e) => e.stopPropagation()}>
            <div className="menu-panel rounded-2xl p-4 flex flex-col gap-1">
              {cfg.navbar.links.map((link) => renderLink(link, true))}
              <div className="border-t border-[#FFFFFF]/10 my-1" />
              <a href={cfg.navbar.signup.href} target="_blank" rel="noopener noreferrer" className="px-3 py-2.5 rounded-xl hover:text-[#FFFFFF] text-sm text-[#FFFFFF]/80">{bi(cfg.navbar.signup.label, lang)}</a>
              <a href={cfg.navbar.login.href} target="_blank" rel="noopener noreferrer" className="px-3 py-2.5 rounded-xl hover:text-[#FFFFFF] text-sm text-[#FFFFFF]/80">{bi(cfg.navbar.login.label, lang)}</a>

              <div className="border-t border-[#FFFFFF]/10 my-1 pt-2">
                {!eaDone ? (
                  <form onSubmit={submitEarlyAccess} className="flex flex-col gap-2 px-1">
                    <input type="email" required value={eaEmail} onChange={(e) => setEaEmail(e.target.value)} placeholder={bi(cfg.navbar.earlyAccess.placeholder, lang)} className="rounded-xl px-3 py-2.5 text-sm text-[#FFFFFF] placeholder-[#FFFFFF]/40 outline-none" />
                    <button type="submit" disabled={eaLoading} className="rounded-xl glass-cta text-sm font-semibold py-2.5 disabled:opacity-60">
                      {eaLoading ? '…' : bi(cfg.navbar.earlyAccess.cta, lang)}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#FFFFFF]">
                    <Check className="w-4 h-4" /> {bi(cfg.navbar.earlyAccess.success, lang)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
