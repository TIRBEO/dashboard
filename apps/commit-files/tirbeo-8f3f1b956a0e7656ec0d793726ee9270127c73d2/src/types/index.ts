export type Locale = 'en' | 'ne';
export type Bilingual = Record<Locale, string>;

export interface NavDropdownItem {
  label: Bilingual;
  href: string;
  desc?: Bilingual;
}

export interface NavLink {
  key: string;
  label: Bilingual;
  target?: string;
  href?: string;
  dropdown?: NavDropdownItem[];
}

export interface NavAction {
  label: Bilingual;
  href: string;
}

export interface CommunityItem {
  name: Bilingual;
  members: string;
}

export interface FeedPost {
  id: number;
  user: string;
  time: string;
  text: Bilingual;
  likes: number;
  replies: number;
}

export interface Principle {
  num: Bilingual;
  title: Bilingual;
  sub: Bilingual;
  desc: Bilingual;
}

export interface SidebarItem {
  id: string;
  icon: string;
  label: Bilingual;
}

export interface PanelRow {
  id: string;
  k: Bilingual;
  v: string | Bilingual;
}

export interface PanelDef {
  title: Bilingual;
  rows: PanelRow[];
}

export interface Testimonial {
  quote: Bilingual;
  name: string;
  role: string;
  avatar: string;
}

export interface FaqItem {
  q: Bilingual;
  a: Bilingual;
}

export interface Product {
  n: string;
  name: Bilingual;
  category: Bilingual;
  cta: Bilingual;
  href: string;
  col1Top: string;
  col1Bottom: string;
  col2: string;
}

export interface FooterColumn {
  title: Bilingual;
  links: { label: Bilingual; href: string }[];
}

export interface ConnectLink {
  label: string;
  icon: string;
  href: string;
}

export interface SiteConfig {
  brand: { name: string; logo: string; glyph: string; logoHref: string };
  flags: { en: string; ne: string };
  navbar: {
    links: NavLink[];
    signup: NavAction;
    login: NavAction;
    earlyAccess: {
      label: Bilingual;
      placeholder: Bilingual;
      cta: Bilingual;
      success: Bilingual;
      href: string;
    };
  };
  hero: {
    tagline: Bilingual;
    title: Bilingual;
    cta: Bilingual;
    placeholderEn: string;
    placeholderNe: string;
    submittedEn: string;
    submittedNe: string;
  };
  preview: {
    heading: Bilingual;
    sub: Bilingual;
    appTitle: Bilingual;
    trending: Bilingual;
    join: Bilingual;
    watching: Bilingual;
    live: Bilingual;
    home: Bilingual;
    share: Bilingual;
    members: Bilingual;
    sidebar: SidebarItem[];
    communities: CommunityItem[];
    feed: FeedPost[];
  };
  about: {
    eyebrow: Bilingual;
    heading: Bilingual;
    scroll: Bilingual;
    paragraphs: Bilingual[];
    mission: Bilingual;
    principles: Principle[];
  };
  chat: {
    eyebrow: Bilingual;
    heading: Bilingual;
    sub: Bilingual;
    gated: Bilingual;
    joinBtn: Bilingual;
    placeholder: Bilingual;
    encrypted: Bilingual;
    peer: string;
  };
  products: {
    heading: Bilingual;
    items: Product[];
  };
  testimonials: {
    heading: Bilingual;
    sub: Bilingual;
    items: Testimonial[];
  };
  faq: {
    eyebrow: Bilingual;
    heading: Bilingual;
    items: FaqItem[];
  };
  newsletter: {
    heading: Bilingual;
    sub: Bilingual;
    emailPlaceholder: Bilingual;
    subscribe: Bilingual;
    subscribed: Bilingual;
    spam: Bilingual;
  };
  footer: {
    tagline: Bilingual;
    rights: Bilingual;
    columns: FooterColumn[];
    connect: ConnectLink[];
    legal: { label: Bilingual; href: string }[];
  };
  background: {
    mode: 'frames' | 'video';
    videoSrc: string;
    frameDir: string;
    frameCount: number;
    overlay: string;
  };
}
