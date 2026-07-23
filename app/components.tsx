'use client';
import { useEffect, useState, createContext, useContext } from 'react';

interface ThemeColors { [key: string]: string; }
interface ThemeBrand { name: string; tagline: string; logo: string; }
interface ThemeContextType { colors: ThemeColors; brand: ThemeBrand; loading: boolean; }

const ThemeCtx = createContext<ThemeContextType>({ colors: {}, brand: { name: 'Tirbeo', tagline: '', logo: '' }, loading: true });
export function useThemeConfig() { return useContext(ThemeCtx); }

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors] = useState<ThemeColors>({});
  const [brand] = useState<ThemeBrand>({ name: 'Tirbeo', tagline: '', logo: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    setLoading(false);
  }, []);

  return <ThemeCtx.Provider value={{ colors, brand, loading }}>{children}</ThemeCtx.Provider>;
}
