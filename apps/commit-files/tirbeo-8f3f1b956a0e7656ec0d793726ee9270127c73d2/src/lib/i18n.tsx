import { createContext, useContext, useState, ReactNode } from 'react';

export type Lang = 'en' | 'ne';

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const I18nContext = createContext<Ctx>({ lang: 'en', setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('tirbeo-lang');
      if (saved === 'en' || saved === 'ne') return saved;
    }
    return 'en';
  });

  const setLang = (l: Lang) => {
    if (typeof window !== 'undefined') window.localStorage.setItem('tirbeo-lang', l);
    setLangState(l);
  };

  return <I18nContext.Provider value={{ lang, setLang }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
