'use client';
import { useEffect, useState, createContext, useContext } from 'react';

interface ThemeColors { [key: string]: string; }
interface ThemeBrand { name: string; tagline: string; logo: string; }
interface ThemeContextType { colors: ThemeColors; brand: ThemeBrand; loading: boolean; }

const ThemeCtx = createContext<ThemeContextType>({ colors: {}, brand: { name: 'Tirbeo', tagline: '', logo: '' }, loading: true });
export function useThemeConfig() { return useContext(ThemeCtx); }

const DEFAULT_COLORS: ThemeColors = {
  '--bg': '#000000', '--bg-surface': 'rgba(255,255,255,0.03)', '--bg-card': 'rgba(255,255,255,0.04)', '--bg-elevated': 'rgba(255,255,255,0.06)',
  '--text': 'rgba(255,255,255,0.92)', '--text-secondary': 'rgba(255,255,255,0.55)', '--text-muted': 'rgba(255,255,255,0.35)',
  '--accent': '#0A84FF', '--accent-hover': '#409CFF', '--accent-muted': 'rgba(10,132,255,0.12)',
  '--success': '#30D158', '--warning': '#FFD60A', '--danger': '#FF453A',
  '--border': 'rgba(255,255,255,0.08)', '--border-hover': 'rgba(255,255,255,0.14)',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS);
  const [brand, setBrand] = useState<ThemeBrand>({ name: 'Tirbeo', tagline: '', logo: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.tirbeo.app';
    fetch(`${API}/api/public/theme`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.colors) setColors(data.colors);
        if (data?.brand) setBrand(data.brand);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch(`${API}/api/profile`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(user => {
        const pref = user?.theme || localStorage.getItem('tirbeo-theme') || 'dark';
        const resolved = pref === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : pref;
        document.documentElement.setAttribute('data-theme', resolved);
      })
      .catch(() => {
        const saved = localStorage.getItem('tirbeo-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
      });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    for (const [key, val] of Object.entries(colors)) {
      if (key.startsWith('--') && val) root.style.setProperty(key, val);
    }
  }, [colors]);

  return <ThemeCtx.Provider value={{ colors, brand, loading }}>{children}</ThemeCtx.Provider>;
}
