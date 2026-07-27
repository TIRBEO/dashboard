import { useState, useEffect } from 'react';
import { Users, Globe, TrendingUp, Bell, Zap, MessageCircle, Share2, Heart } from 'lucide-react';
import { useI18n } from '../../../lib/i18n';
import { useSiteConfig, bi } from '../../../lib/useSiteConfig';
import { previewSidebar, previewCommunities, previewFeed, previewConfig } from '../../../config/preview';
import { panelData } from '../../../config/previewPanels';

const iconMap: Record<string, JSX.Element> = {
  Users: <Users className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  Bell: <Bell className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  MessageCircle: <MessageCircle className="w-4 h-4" />,
  Share2: <Share2 className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
};

const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n));

export const AppPreview = () => {
  const [active, setActive] = useState('profile');
  const { lang } = useI18n();
  const cfg = useSiteConfig();

  const sidebar = previewSidebar.map((s) => ({
    id: s.id,
    icon: iconMap[s.icon] ?? <Users className="w-4 h-4" />,
    label: bi(s.label, lang),
  }));

  const communities = previewCommunities.map((c) => ({ name: bi(c.name, lang), members: c.members }));

  const [feed, setFeed] = useState(previewFeed);
  const [liveViewers, setLiveViewers] = useState(1284);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFeed((prev) =>
        prev.map((p) => ({
          ...p,
          likes: p.likes + Math.floor(Math.random() * 7),
          replies: p.replies + (Math.random() < 0.5 ? 1 : 0),
        }))
      );
      setLiveViewers((v) => Math.max(900, v + Math.floor(Math.random() * 21) - 10));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const panel = {
    title: bi(cfg.preview.sidebar.find((s) => s.id === active)?.label ?? cfg.preview.sidebar[0].label, lang),
    rows: panelData[active] ?? panelData.profile,
  };
  const isHome = active === 'profile';

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center mb-12 reveal">
        <h2 className="silver-heading font-black uppercase leading-[0.95] tracking-tight text-[clamp(3rem,13vw,180px)]">{bi(previewConfig.heading, lang)}</h2>
        <p className="mt-4 text-[#FFFFFF]/50 text-sm">{bi(previewConfig.sub, lang)}</p>
      </div>

      <div className="reveal relative">
        <div className="relative rounded-[28px] overflow-hidden liquid-glass">
          {/* window title bar */}
          <div className="h-10 border-b border-[#FFFFFF]/10 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFFFFF]/25" />
            <div className="w-3 h-3 rounded-full bg-[#FFFFFF]/20" />
            <div className="w-3 h-3 rounded-full bg-[#FFFFFF]/15" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs text-[#FFFFFF]/50">{bi(previewConfig.appTitle, lang)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
            {/* Left sidebar — nav */}
            <div className="md:flex col-span-12 md:col-span-3 border-b md:border-b-0 md:border-r border-[#FFFFFF]/10 flex-row md:flex-col p-3 md:p-4 gap-1 overflow-x-auto md:overflow-visible">
              <div className="hidden md:flex items-center gap-3 mb-4 px-2 py-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFFFFF]/80 to-[#FFFFFF]/20 border border-[#FFFFFF]/15" />
                <div>
                  <div className="text-sm font-semibold text-[#FFFFFF]">@yourhandle</div>
                  <div className="text-xs text-[#FFFFFF]/50">{lang === 'ne' ? 'निर्माता' : 'Creator'}</div>
                </div>
              </div>
              {sidebar.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap ${active === item.id ? 'text-[#FFFFFF] shadow-[inset_0_1px_rgba(255,255,255,0.15)]' : 'text-[#FFFFFF]/60 hover:text-[#FFFFFF]'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Main panel — content depends on the selected sidebar item */}
            <div className="col-span-12 md:col-span-6 border-b md:border-b-0 md:border-r border-[#FFFFFF]/10 overflow-y-auto">
              <div className="p-4 border-b border-[#FFFFFF]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#FFFFFF]">{isHome ? bi(previewConfig.home, lang) : panel.title}</span>
                  {isHome && (
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {bi(previewConfig.live, lang)}
                    </span>
                  )}
                </div>
                {isHome && <span className="text-[11px] text-[#FFFFFF]/45">{liveViewers.toLocaleString()} {bi(previewConfig.watching, lang)}</span>}
              </div>

              {isHome ? (
                <div className="p-4 flex flex-col gap-3">
                  {feed.map((post) => (
                    <div key={post.id} className="rounded-2xl border border-[#FFFFFF]/10 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFFFFF]/70 to-[#FFFFFF]/20" />
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-semibold text-[#FFFFFF]">{post.user}</span>
                          <span className="text-[11px] text-[#FFFFFF]/40">{post.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-[#FFFFFF]/80 leading-relaxed">{bi(post.text, lang)}</p>
                      <div className="mt-3 flex items-center gap-5 text-xs text-[#FFFFFF]/45">
                        <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {fmt(post.likes)}</span>
                        <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> {fmt(post.replies)}</span>
                        <span className="flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> {bi(previewConfig.share, lang)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 flex flex-col gap-2">
                  {panel.rows.map((row) => (
                    <div key={row.id} className="flex items-center justify-between py-3.5 px-4 rounded-2xl border border-[#FFFFFF]/10">
                      <span className="text-sm text-[#FFFFFF]/70">{bi(row.k, lang)}</span>
                      <span className="text-sm font-medium text-[#FFFFFF]">{typeof row.v === 'object' ? bi(row.v, lang) : row.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right panel — trending communities */}
            <div className="col-span-12 md:col-span-3 flex flex-col p-5 gap-2">
              <div className="text-xs font-semibold text-[#FFFFFF]/50 uppercase tracking-widest mb-2">{bi(previewConfig.trending, lang)}</div>
              {communities.map((c) => (
                <div key={c.name} className="flex items-center justify-between py-3 border-b border-[#FFFFFF]/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl border border-[#FFFFFF]/10" />
                    <div>
                      <div className="text-sm text-[#FFFFFF] font-medium">{c.name}</div>
                      <div className="text-xs text-[#FFFFFF]/40">{c.members} {bi(previewConfig.members, lang)}</div>
                    </div>
                  </div>
                  <button className="text-xs text-[#FFFFFF]/70 border border-[#FFFFFF]/15 rounded-full px-3 py-1 hover:text-[#FFFFFF] transition-all">{bi(previewConfig.join, lang)}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
