import type { Metadata } from 'next';
import { TirbeoThemeProvider } from '@tirbeo/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dashboard — Tirbeo',
  description: 'Your Tirbeo account dashboard',
};

const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('tirbeo-theme-mode') || 'dark';
      var root = document.documentElement;
      root.classList.remove('dark', 'light');
      root.classList.add(theme);
      root.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

const langScript = `
  (function() {
    try {
      var lang = localStorage.getItem('tb_lang') || 'en';
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('data-lang', lang);
    } catch (e) {
      document.documentElement.setAttribute('lang', 'en');
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body style={{ margin: 0, padding: 0, background: 'var(--tb-bg)', color: 'var(--tb-text-primary)' }}>
        <TirbeoThemeProvider>
          {children}
        </TirbeoThemeProvider>
      </body>
    </html>
  );
}
