// ─── Configuration Engine ───
// Universal config system: Local defaults + Supabase overrides per-section
// Priority: Supabase (100) > Preview (60) > Draft (50) > Published (40) > Local (10)

import type { SiteConfig } from '../types';
import { defaultSiteConfig } from '../config';

// ─── Provider Types ───
export type ConfigSource = 'local' | 'draft' | 'published' | 'preview' | 'supabase';

export interface ConfigProvider {
  readonly name: ConfigSource;
  readonly priority: number;
  load(): Promise<Partial<SiteConfig> | null>;
  save?(section: string, data: unknown): Promise<void>;
}

// ─── Section Registry (for Admin UI) ───
export interface ConfigSection {
  key: string;
  label: string;
  description?: string;
  editable: boolean;
}

export const sectionRegistry: Record<string, ConfigSection> = {
  brand: { key: 'brand', label: 'Brand', description: 'Logo, name, glyph, homepage URL', editable: true },
  flags: { key: 'flags', label: 'Language Flags', description: 'Flag images for EN/NE', editable: true },
  navbar: { key: 'navbar', label: 'Navigation', description: 'Menu links, signup/login, early access form', editable: true },
  hero: { key: 'hero', label: 'Hero Section', description: 'Tagline, title, CTA, email capture', editable: true },
  preview: { key: 'preview', label: 'App Preview', description: 'App mockup, sidebar, feed, communities', editable: true },
  about: { key: 'about', label: 'About', description: 'Mission, principles, paragraphs', editable: true },
  chat: { key: 'chat', label: 'Chat Demo', description: 'AI chat widget, placeholder, encrypted badge', editable: true },
  products: { key: 'products', label: 'Products', description: 'Product cards with images', editable: true },
  testimonials: { key: 'testimonials', label: 'Testimonials', description: 'Customer quotes carousel', editable: true },
  faq: { key: 'faq', label: 'FAQ', description: 'Frequently asked questions', editable: true },
  newsletter: { key: 'newsletter', label: 'Newsletter', description: 'Email capture form', editable: true },
  footer: { key: 'footer', label: 'Footer', description: 'Columns, social links, legal', editable: true },
  background: { key: 'background', label: 'Background', description: 'Video/frames mode, overlay', editable: true },
};

// ─── Field Definitions (for Admin UI field generation) ───
export interface ConfigField {
  key: string;
  type: 'text' | 'bilingual' | 'url' | 'number' | 'select' | 'boolean' | 'array' | 'icon' | 'color' | 'image' | 'object';
  label: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  fields?: ConfigField[];
  itemType?: 'object' | 'bilingual' | 'text' | 'number' | 'url';
  placeholder?: string;
}

export const fieldDefinitions: Record<string, ConfigField[]> = {
  brand: [
    { key: 'name', type: 'text', label: 'Brand Name', required: true },
    { key: 'logo', type: 'image', label: 'Logo', required: true },
    { key: 'glyph', type: 'text', label: 'Glyph Icon' },
    { key: 'logoHref', type: 'url', label: 'Logo Link', required: true },
  ],
  flags: [
    { key: 'en', type: 'image', label: 'English Flag', required: true },
    { key: 'ne', type: 'image', label: 'Nepali Flag', required: true },
  ],
  navbar: [
    { key: 'links', type: 'array', label: 'Nav Links', itemType: 'object', fields: [
      { key: 'key', type: 'text', label: 'Key' },
      { key: 'label', type: 'bilingual', label: 'Label', required: true },
      { key: 'href', type: 'url', label: 'Href' },
      { key: 'target', type: 'text', label: 'Target' },
    ]},
    { key: 'signup', type: 'object', label: 'Sign Up Button', fields: [
      { key: 'label', type: 'bilingual', label: 'Label', required: true },
      { key: 'href', type: 'url', label: 'Href', required: true },
    ]},
    { key: 'login', type: 'object', label: 'Login Button', fields: [
      { key: 'label', type: 'bilingual', label: 'Label', required: true },
      { key: 'href', type: 'url', label: 'Href', required: true },
    ]},
    { key: 'earlyAccess', type: 'object', label: 'Early Access Form', fields: [
      { key: 'label', type: 'bilingual', label: 'Label', required: true },
      { key: 'placeholder', type: 'bilingual', label: 'Placeholder' },
      { key: 'cta', type: 'bilingual', label: 'CTA Text' },
      { key: 'success', type: 'bilingual', label: 'Success Message' },
      { key: 'href', type: 'url', label: 'Redirect URL' },
    ]},
  ],
  hero: [
    { key: 'tagline', type: 'bilingual', label: 'Tagline', required: true },
    { key: 'title', type: 'bilingual', label: 'Title', required: true },
    { key: 'cta', type: 'bilingual', label: 'CTA Text', required: true },
    { key: 'placeholderEn', type: 'text', label: 'Placeholder (EN)' },
    { key: 'placeholderNe', type: 'text', label: 'Placeholder (NE)' },
    { key: 'submittedEn', type: 'text', label: 'Submitted (EN)' },
    { key: 'submittedNe', type: 'text', label: 'Submitted (NE)' },
  ],
  preview: [
    { key: 'heading', type: 'bilingual', label: 'Heading', required: true },
    { key: 'sub', type: 'bilingual', label: 'Subtitle' },
    { key: 'appTitle', type: 'bilingual', label: 'App Title' },
    { key: 'trending', type: 'bilingual', label: 'Trending Label' },
    { key: 'join', type: 'bilingual', label: 'Join Button' },
    { key: 'watching', type: 'bilingual', label: 'Watching Label' },
    { key: 'live', type: 'bilingual', label: 'Live Badge' },
    { key: 'home', type: 'bilingual', label: 'Home Tab' },
    { key: 'share', type: 'bilingual', label: 'Share Label' },
    { key: 'members', type: 'bilingual', label: 'Members Label' },
    { key: 'sidebar', type: 'array', label: 'Sidebar Items', itemType: 'object', fields: [
      { key: 'id', type: 'text', label: 'ID', required: true },
      { key: 'icon', type: 'icon', label: 'Icon', required: true },
      { key: 'label', type: 'bilingual', label: 'Label', required: true },
    ]},
    { key: 'communities', type: 'array', label: 'Communities', itemType: 'object', fields: [
      { key: 'name', type: 'bilingual', label: 'Name', required: true },
      { key: 'members', type: 'text', label: 'Member Count' },
    ]},
    { key: 'feed', type: 'array', label: 'Feed Posts', itemType: 'object', fields: [
      { key: 'id', type: 'number', label: 'ID', required: true },
      { key: 'user', type: 'text', label: 'User', required: true },
      { key: 'time', type: 'text', label: 'Time' },
      { key: 'text', type: 'bilingual', label: 'Text', required: true },
      { key: 'likes', type: 'number', label: 'Likes' },
      { key: 'replies', type: 'number', label: 'Replies' },
    ]},
  ],
  about: [
    { key: 'eyebrow', type: 'bilingual', label: 'Eyebrow' },
    { key: 'heading', type: 'bilingual', label: 'Heading', required: true },
    { key: 'scroll', type: 'bilingual', label: 'Scroll Label' },
    { key: 'paragraphs', type: 'array', label: 'Paragraphs', itemType: 'bilingual' },
    { key: 'mission', type: 'bilingual', label: 'Mission' },
    { key: 'principles', type: 'array', label: 'Principles', itemType: 'object', fields: [
      { key: 'num', type: 'bilingual', label: 'Number' },
      { key: 'title', type: 'bilingual', label: 'Title' },
      { key: 'sub', type: 'bilingual', label: 'Subtitle' },
      { key: 'desc', type: 'bilingual', label: 'Description' },
    ]},
  ],
  chat: [
    { key: 'eyebrow', type: 'bilingual', label: 'Eyebrow' },
    { key: 'heading', type: 'bilingual', label: 'Heading', required: true },
    { key: 'sub', type: 'bilingual', label: 'Subtitle' },
    { key: 'gated', type: 'bilingual', label: 'Gated Message' },
    { key: 'joinBtn', type: 'bilingual', label: 'Join Button' },
    { key: 'placeholder', type: 'bilingual', label: 'Placeholder' },
    { key: 'encrypted', type: 'bilingual', label: 'Encrypted Badge' },
    { key: 'peer', type: 'text', label: 'Peer Name' },
  ],
  products: [
    { key: 'heading', type: 'bilingual', label: 'Heading' },
    { key: 'items', type: 'array', label: 'Products', itemType: 'object', fields: [
      { key: 'n', type: 'text', label: 'Number', required: true },
      { key: 'name', type: 'bilingual', label: 'Name', required: true },
      { key: 'category', type: 'bilingual', label: 'Category' },
      { key: 'cta', type: 'bilingual', label: 'CTA', required: true },
      { key: 'href', type: 'url', label: 'Link', required: true },
      { key: 'col1Top', type: 'image', label: 'Column 1 Top Image' },
      { key: 'col1Bottom', type: 'image', label: 'Column 1 Bottom Image' },
      { key: 'col2', type: 'image', label: 'Column 2 Image' },
    ]},
  ],
  testimonials: [
    { key: 'heading', type: 'bilingual', label: 'Heading' },
    { key: 'sub', type: 'bilingual', label: 'Subtitle' },
    { key: 'items', type: 'array', label: 'Testimonials', itemType: 'object', fields: [
      { key: 'quote', type: 'bilingual', label: 'Quote', required: true },
      { key: 'name', type: 'text', label: 'Name', required: true },
      { key: 'role', type: 'text', label: 'Role', required: true },
      { key: 'avatar', type: 'image', label: 'Avatar', required: true },
    ]},
  ],
  faq: [
    { key: 'eyebrow', type: 'bilingual', label: 'Eyebrow' },
    { key: 'heading', type: 'bilingual', label: 'Heading' },
    { key: 'items', type: 'array', label: 'FAQs', itemType: 'object', fields: [
      { key: 'q', type: 'bilingual', label: 'Question', required: true },
      { key: 'a', type: 'bilingual', label: 'Answer', required: true },
    ]},
  ],
  newsletter: [
    { key: 'heading', type: 'bilingual', label: 'Heading' },
    { key: 'sub', type: 'bilingual', label: 'Subtitle' },
    { key: 'emailPlaceholder', type: 'bilingual', label: 'Email Placeholder' },
    { key: 'subscribe', type: 'bilingual', label: 'Subscribe Button' },
    { key: 'subscribed', type: 'bilingual', label: 'Subscribed Message' },
    { key: 'spam', type: 'bilingual', label: 'Spam Disclaimer' },
  ],
  footer: [
    { key: 'tagline', type: 'bilingual', label: 'Tagline' },
    { key: 'rights', type: 'bilingual', label: 'Rights' },
    { key: 'columns', type: 'array', label: 'Footer Columns', itemType: 'object', fields: [
      { key: 'title', type: 'bilingual', label: 'Title', required: true },
      { key: 'links', type: 'array', label: 'Links', itemType: 'object', fields: [
        { key: 'label', type: 'bilingual', label: 'Label', required: true },
        { key: 'href', type: 'url', label: 'Href', required: true },
      ]},
    ]},
    { key: 'connect', type: 'array', label: 'Social Links', itemType: 'object', fields: [
      { key: 'label', type: 'text', label: 'Label', required: true },
      { key: 'icon', type: 'icon', label: 'Icon', required: true },
      { key: 'href', type: 'url', label: 'Href', required: true },
    ]},
    { key: 'legal', type: 'array', label: 'Legal Links', itemType: 'object', fields: [
      { key: 'label', type: 'bilingual', label: 'Label', required: true },
      { key: 'href', type: 'url', label: 'Href', required: true },
    ]},
  ],
  background: [
    { key: 'mode', type: 'select', label: 'Mode', options: [{ value: 'frames', label: 'Frames' }, { value: 'video', label: 'Video' }], required: true },
    { key: 'videoSrc', type: 'url', label: 'Video Source (M3U8)' },
    { key: 'frameDir', type: 'text', label: 'Frames Directory' },
    { key: 'frameCount', type: 'number', label: 'Frame Count' },
    { key: 'overlay', type: 'text', label: 'Overlay Gradient' },
  ],
};

// ─── Merge Strategy ───
// Local is always the base. Higher-priority providers override per-section.
// Arrays are replaced entirely (not merged by index).
function deepMerge(base: SiteConfig, override: Partial<SiteConfig>): SiteConfig {
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(override) as (keyof SiteConfig)[]) {
    const val = override[key];
    if (val === undefined) continue;
    const baseVal = base[key];
    if (
      val && typeof val === 'object' && !Array.isArray(val) &&
      baseVal && typeof baseVal === 'object' && !Array.isArray(baseVal)
    ) {
      out[key] = { ...(baseVal as object), ...(val as object) };
    } else {
      out[key] = val;
    }
  }
  return out as unknown as SiteConfig;
}

// ─── Configuration Engine ───
class ConfigEngine {
  private providers: ConfigProvider[] = [];
  private currentConfig: SiteConfig | null = null;
  private subscribers = new Set<(config: SiteConfig) => void>();
  private initialized = false;

  registerProvider(provider: ConfigProvider) {
    // Avoid duplicates
    if (this.providers.some(p => p.name === provider.name)) return;
    this.providers.push(provider);
    this.providers.sort((a, b) => b.priority - a.priority);
  }

  removeProvider(name: ConfigSource) {
    this.providers = this.providers.filter(p => p.name !== name);
  }

  async initialize(): Promise<SiteConfig> {
    if (this.initialized) return this.currentConfig!;

    // 1. Always start with local defaults
    let merged = { ...defaultSiteConfig } as SiteConfig;

    // 2. Load all providers sorted by priority (highest first)
    for (const provider of this.providers) {
      if (provider.name === 'local') continue; // already loaded
      try {
        const data = await provider.load();
        if (data && Object.keys(data).length > 0) {
          merged = deepMerge(merged, data);
        }
      } catch (e) {
        console.warn(`Config provider ${provider.name} failed:`, e);
      }
    }

    // 3. Sync chat.peer with brand.name
    if (merged.chat && merged.brand) {
      merged.chat.peer = merged.brand.name;
    }

    this.currentConfig = merged;
    this.initialized = true;
    this.notify();
    return this.currentConfig;
  }

  getConfig(): SiteConfig {
    if (!this.currentConfig) return { ...defaultSiteConfig } as SiteConfig;
    return this.currentConfig;
  }

  getSection<K extends keyof SiteConfig>(section: K): SiteConfig[K] {
    return this.getConfig()[section];
  }

  getField(section: string, path: string): unknown {
    const sectionData = this.getConfig()[section as keyof SiteConfig];
    if (!sectionData) return undefined;
    return path.split('.').reduce((obj: unknown, key: string) =>
      (obj as Record<string, unknown>)?.[key], sectionData);
  }

  async updateSection(section: string, data: Partial<SiteConfig[keyof SiteConfig]>): Promise<void> {
    // Find highest-priority writable provider
    const provider = this.providers.find(p => p.save);
    if (!provider || !provider.save) throw new Error('No writable provider available');

    await provider.save(section, data);

    // Reload to get merged result
    this.initialized = false;
    await this.initialize();
  }

  subscribe(callback: (config: SiteConfig) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    if (this.currentConfig) {
      this.subscribers.forEach(cb => cb(this.currentConfig!));
    }
  }
}

// ─── Singleton ───
export const configEngine = new ConfigEngine();

// ─── Local Provider (always available) ───
export const localProvider: ConfigProvider = {
  name: 'local',
  priority: 10,
  async load() {
    return defaultSiteConfig;
  },
};

// ─── Supabase Provider ───
export function createSupabaseProvider(supabaseUrl: string, supabaseKey: string): ConfigProvider {
  return {
    name: 'supabase',
    priority: 100,
    async load() {
      const res = await fetch(`${supabaseUrl}/rest/v1/site_config?select=section,data`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      });
      if (!res.ok) return null;
      const rows = await res.json();
      const merged: Partial<SiteConfig> = {};
      for (const row of rows) {
        merged[row.section as keyof SiteConfig] = row.data as never;
      }
      return Object.keys(merged).length ? merged : null;
    },
    async save(section: string, data: unknown) {
      await fetch(`${supabaseUrl}/rest/v1/site_config`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({ section, data, updated_at: new Date().toISOString() }),
      });
    },
  };
}

// ─── Draft Provider (Admin unsaved edits) ───
const draftStore = new Map<string, unknown>();
export const draftProvider: ConfigProvider = {
  name: 'draft',
  priority: 50,
  async load() {
    const result: Partial<SiteConfig> = {};
    for (const [section, data] of draftStore) {
      result[section as keyof SiteConfig] = data as never;
    }
    return Object.keys(result).length ? result : null;
  },
  async save(section: string, data: unknown) {
    draftStore.set(section, data);
  },
};

// ─── Published Provider ───
const publishedStore = new Map<string, unknown>();
export const publishedProvider: ConfigProvider = {
  name: 'published',
  priority: 40,
  async load() {
    const result: Partial<SiteConfig> = {};
    for (const [section, data] of publishedStore) {
      result[section as keyof SiteConfig] = data as never;
    }
    return Object.keys(result).length ? result : null;
  },
  async save(section: string, data: unknown) {
    publishedStore.set(section, data);
  },
};

// ─── Preview Provider (Live preview in Admin) ───
const previewStore = new Map<string, unknown>();
export const previewProvider: ConfigProvider = {
  name: 'preview',
  priority: 60,
  async load() {
    const result: Partial<SiteConfig> = {};
    for (const [section, data] of previewStore) {
      result[section as keyof SiteConfig] = data as never;
    }
    return Object.keys(result).length ? result : null;
  },
  async save(section: string, data: unknown) {
    previewStore.set(section, data);
  },
};

// ─── Register local provider (always) ───
configEngine.registerProvider(localProvider);

// ─── Initialize engine (auto-registers Supabase if env vars present) ───
export async function initConfigEngine(): Promise<SiteConfig> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Always register Supabase if credentials are available
  if (supabaseUrl && supabaseKey) {
    configEngine.registerProvider(createSupabaseProvider(supabaseUrl, supabaseKey));
  }

  return configEngine.initialize();
}

// ─── React Hooks ───
import { useEffect, useState } from 'react';

export function useConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig>(() => configEngine.getConfig());
  useEffect(() => configEngine.subscribe(setConfig), []);
  return config;
}

export function useConfigSection<K extends keyof SiteConfig>(section: K): SiteConfig[K] {
  return useConfig()[section];
}
