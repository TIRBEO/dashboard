// ─── Config Entry Point ───
// Assembles defaultSiteConfig from modular config files.
// Types are in ../types, engine is in ../lib/configEngine.

import type { SiteConfig } from '../types';
import { brandConfig, flagsConfig } from './brand';
import { navbarLinks, navbarSignup, navbarLogin, navbarEarlyAccess } from './navbar';
import { heroConfig } from './hero';
import { previewConfig, previewSidebar, previewCommunities, previewFeed } from './preview';
import { aboutConfig } from './about';
import { chatConfig } from './chat';
import { productsConfig } from './products';
import { testimonialsConfig } from './testimonials';
import { faqConfig } from './faq';
import { newsletterConfig } from './newsletter';
import { footerConfig } from './footer';

export const defaultSiteConfig: SiteConfig = {
  brand: brandConfig,
  flags: flagsConfig,
  navbar: { links: navbarLinks, signup: navbarSignup, login: navbarLogin, earlyAccess: navbarEarlyAccess },
  hero: heroConfig,
  preview: { ...previewConfig, sidebar: previewSidebar, communities: previewCommunities, feed: previewFeed },
  about: aboutConfig,
  chat: chatConfig,
  products: productsConfig,
  testimonials: testimonialsConfig,
  faq: faqConfig,
  newsletter: newsletterConfig,
  footer: footerConfig,
  background: { mode: 'frames', videoSrc: 'https://stream.mux.com/kimF2ha9zLrX64H00UgLGPflCzNtl1T0215MlAmeOztv8.m3u8', frameDir: '/frames/', frameCount: 300, overlay: 'from-black/40 via-black/20 to-black/40' },
};
