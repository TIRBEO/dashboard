import { useState, useEffect, useRef } from 'react';
import { Send, CheckCheck, ShieldCheck } from 'lucide-react';
import { useReveal } from '../../../lib/useReveal';
import { useI18n } from '../../../lib/i18n';
import { useSiteConfig, bi } from '../../../lib/useSiteConfig';
import { SYSTEM_PROMPT } from '../../../features/chat/systemPrompt';
import { loadMessages, saveMessages } from '../../../features/chat/storage';
import { localReply } from '../../../features/chat/localReply';
import FormattedText from '../../../features/chat/FormattedText';
import type { Message } from '../../../features/chat/types';

export const ChatSection = () => {
  const ref = useReveal<HTMLElement>();
  const { lang } = useI18n();
  const cfg = useSiteConfig();
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const trap = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
      el.scrollTop += e.deltaY;
    };
    el.addEventListener('wheel', trap, { passive: false });
    return () => el.removeEventListener('wheel', trap);
  }, []);

  const now = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const lastBotText = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].from === 'them') return messages[i].text;
    }
    return undefined;
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const myId = messages.length;
    const meMsg: Message = { id: myId, from: 'me', text, time: now() };
    const history = [...messages, meMsg];
    setMessages(history);
    setInput('');
    setTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tencent/hy3:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.map((m) => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text })),
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { id: m.length, from: 'them', text: localReply(text, lastBotText()), time: now() }]);
        return;
      }
      const reply = data?.choices?.[0]?.message?.content?.trim() || localReply(text, lastBotText());
      setMessages((m) => [...m, { id: m.length, from: 'them', text: reply, time: now() }]);
    } catch {
      setMessages((m) => [...m, { id: m.length, from: 'them', text: localReply(text, lastBotText()), time: now() }]);
    } finally {
      setTyping(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <section id="chat" ref={ref} className="relative z-10 border-t border-[#FFFFFF]/10 py-24 md:py-36">
      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 md:gap-24 items-center">
        <div>
          <h2 className="reveal silver-heading font-black uppercase leading-[0.95] tracking-tight text-[clamp(2rem,6vw,76px)]">
            {bi(cfg.chat.heading, lang)}
          </h2>
          <p className="reveal mt-8 text-base text-[#FFFFFF]/60 leading-[1.9] max-w-md">
            {bi(cfg.chat.sub, lang)}
          </p>
        </div>

        <div className="reveal relative mx-auto w-full max-w-[420px]">
          <div className="relative rounded-[2rem] border border-[#FFFFFF]/15 bg-black/40 backdrop-blur-2xl shadow-[0_0_80px_rgba(216,216,224,0.07)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-[#FFFFFF]/10 bg-white/[0.02]">
              <div className="relative">
                <img src={cfg.brand.logo} alt={cfg.brand.name} className="w-12 rounded-full object-cover shadow-lg" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white border-2 border-black rounded-full" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[#FFFFFF] font-medium text-[15px] leading-tight">{cfg.chat.peer}</h3>
                <p className="text-[#FFFFFF]/40 text-[11px] mt-0.5 font-medium tracking-wide uppercase">Online now</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="chat-scroll p-6 h-[400px] overflow-y-auto overscroll-contain touch-pan-y flex flex-col gap-5">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.from === 'me' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-[1.25rem] px-5 py-3 text-[14px] leading-[1.6] shadow-sm ${m.from === 'me' ? 'bg-gradient-to-br from-[#FFFFFF] to-[#FFFFFF]/80 text-[#0c0c0c] rounded-br-sm font-medium' : 'bg-[#FFFFFF]/[0.04] text-[#FFFFFF]/90 rounded-bl-sm border border-[#FFFFFF]/10'}`}>
                    <FormattedText text={m.text} />
                  </div>
                  <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] text-[#FFFFFF]/30 px-1 font-medium tracking-wide ${m.from === 'me' ? 'flex-row-reverse' : ''}`}>
                    {m.time}
                    {m.from === 'me' && <CheckCheck className="w-3.5 h-3.5 text-[#FFFFFF]/50" />}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 rounded-[1.25rem] rounded-bl-sm border border-[#FFFFFF]/10 bg-[#FFFFFF]/[0.02] px-5 py-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF]/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF]/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF]/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <form onSubmit={send} className="p-4 bg-white/[0.01] border-t border-[#FFFFFF]/10">
              <div className="relative flex items-center">
                <input value={input} onChange={(e) => setInput(e.target.value)} type="text" placeholder={bi(cfg.chat.placeholder, lang)} className="w-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-full pl-5 pr-14 py-3.5 text-[14px] text-[#FFFFFF] placeholder-[#FFFFFF]/30 outline-none focus:border-[#FFFFFF]/30 focus:bg-[#FFFFFF]/[0.07] transition-all" />
                <button type="submit" className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-full bg-[#FFFFFF] text-[#0c0c0c] hover:scale-105 active:scale-95 transition-transform">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </form>

            {/* Encrypted badge */}
            <div className="flex items-center justify-center gap-1.5 py-2.5 border-t border-[#FFFFFF]/[0.06]">
              <ShieldCheck className="w-3 h-3 text-[#FFFFFF]/30" />
              <span className="text-[10px] uppercase tracking-widest text-[#FFFFFF]/25 font-semibold">{bi(cfg.chat.encrypted, lang)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
