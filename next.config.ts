import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  transpilePackages: ['@tirbeo/ui', '@tirbeo/theme', '@tirbeo/icons', '@tirbeo/charts', '@tirbeo/utils', '@tirbeo/config'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }, { protocol: 'http', hostname: '**' }],
    dangerouslyAllowSVG: true,
  },
  async rewrites() {
    // Proxy /api to api.tirbeo.app to avoid CORS (browser does same-origin fetch, Vercel proxies server-side)
    // This fixes: Credential is not supported if ACAO is '*' for cross-origin https://api.tirbeo.app
    if (isDev) return [];
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.tirbeo.app/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), serial=(), midi=(), sync-xhr=(), autoplay=(), display-capture=(), fullscreen=(), picture-in-picture=(), screen-wake-lock=(), clipboard-read=(), clipboard-write=()' },
          // script-src-elem cannot contain unsafe-eval per spec (ignored warning) — keep unsafe-eval only in script-src
          { key: 'Content-Security-Policy', value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cloud.umami.is https://va.vercel-scripts.com https://*.vercel-scripts.com https://vercel.live https://cdn.discordapp.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com; script-src-elem 'self' 'unsafe-inline' https://cloud.umami.is https://va.vercel-scripts.com https://*.vercel-scripts.com https://cdn.discordapp.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' ${isDev ? 'http://localhost:3000 http://127.0.0.1:3000' : ''} https://api.tirbeo.app https://cloud.umami.is https://va.vercel-scripts.com https://cdn.discordapp.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com https: wss: ws:; worker-src 'self' blob:; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none';` },
          // Fix CORS for dashboard.tirbeo.app/support/tickets etc when fetched with credentials — allow specific origin, not *
          { key: 'Access-Control-Allow-Origin', value: 'https://dashboard.tirbeo.app' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-CSRF-Token' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://dashboard.tirbeo.app' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-CSRF-Token' },
        ],
      },
    ];
  },
};

export default nextConfig;
