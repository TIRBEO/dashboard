import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { TirbeoThemeProvider } from '@tirbeo/theme';

import './globals.css';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://tirbeo.com';

const UMAMI_WEBSITE_ID =
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ||
  '60324c6a-e4c2-4e92-b1f6-280cf3ef30a1';

const APP_NAME = 'Tirbeo';
const APP_DESCRIPTION = 'Your Tirbeo account dashboard';

/**
 * Metadata
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `Dashboard — ${APP_NAME}`,
    template: `%s — ${APP_NAME}`,
  },

  description: APP_DESCRIPTION,

  applicationName: APP_NAME,

  generator: 'Next.js',

  authors: [
    {
      name: APP_NAME,
      url: SITE_URL,
    },
  ],

  creator: APP_NAME,
  publisher: APP_NAME,

  referrer: 'strict-origin-when-cross-origin',

  alternates: {
    canonical: '/',
  },

  icons: {
    icon: [
      {
        url: '/logo.png',
        type: 'image/png',
      },
    ],
    shortcut: ['/logo.png'],
    apple: [
      {
        url: '/logo.png',
        type: 'image/png',
      },
    ],
  },

  manifest: '/manifest.webmanifest',

  /*
   * This is an account dashboard.
   * Prevent search engines from indexing private content.
   */
  robots: {
    index: false,
    follow: false,
    nocache: true,

    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
      noarchive: true,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: APP_NAME,

    title: `Dashboard — ${APP_NAME}`,
    description: APP_DESCRIPTION,

    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${APP_NAME} Dashboard`,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',

    title: `Dashboard — ${APP_NAME}`,
    description: APP_DESCRIPTION,

    images: ['/og-image.png'],
  },
};

/**
 * Viewport / mobile / theme configuration
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',

  colorScheme: 'dark light',

  themeColor: [
    {
      media: '(prefers-color-scheme: dark)',
      color: '#0a0a0a',
    },
    {
      media: '(prefers-color-scheme: light)',
      color: '#ffffff',
    },
  ],
};

/**
 * Apply the saved theme before React hydration.
 *
 * This prevents the common:
 * "flash of the wrong theme"
 * problem.
 */
const themeScript = `
(function () {
  try {
    var root = document.documentElement;
    var stored = localStorage.getItem('tirbeo-theme-mode');

    var theme =
      stored === 'light' || stored === 'dark'
        ? stored
        : 'dark';

    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  } catch (error) {
    var root = document.documentElement;

    root.classList.remove('light');
    root.classList.add('dark');

    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  }
})();
`;

/**
 * Apply saved language before React hydration.
 */
const languageScript = `
(function () {
  try {
    var root = document.documentElement;
    var stored = localStorage.getItem('tb_lang');

    var language =
      typeof stored === 'string' && stored.trim()
        ? stored
        : 'en';

    root.setAttribute('lang', language);
    root.setAttribute('data-lang', language);
  } catch (error) {
    document.documentElement.setAttribute('lang', 'en');
    document.documentElement.setAttribute('data-lang', 'en');
  }
})();
`;

/**
 * Root Layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/*
         * Theme must run immediately to prevent
         * light/dark mode flashing.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />

        {/*
         * Language must also be restored before hydration.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: languageScript,
          }}
        />

        {/*
         * DNS/TLS connection optimization for Umami.
         */}
        <link
          rel="preconnect"
          href="https://cloud.umami.is"
          crossOrigin=""
        />
      </head>

      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100svh',

          background: 'var(--tb-bg)',
          color: 'var(--tb-text-primary)',

          /*
           * Prevent accidental horizontal overflow.
           */
          overflowX: 'hidden',

          /*
           * Better mobile rendering.
           */
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        <TirbeoThemeProvider>
          {children}
        </TirbeoThemeProvider>

        {/*
         * Vercel Analytics
         */}
        <Analytics />

        {/*
         * Vercel Speed Insights / Core Web Vitals
         */}
        <SpeedInsights />

        {/*
         * Umami Analytics
         *
         * lazyOnload prevents analytics from competing
         * with initial page rendering.
         */}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id={UMAMI_WEBSITE_ID}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}