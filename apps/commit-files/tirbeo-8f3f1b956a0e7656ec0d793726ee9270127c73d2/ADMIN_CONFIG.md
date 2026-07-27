# TIRBEO Landing — Content Configuration & Admin Panel Guide

The entire landing page is driven by a single JSON config object. There is **no hard-coded copy** — every visible string, link, image and background setting comes from this config. The site loads it from a database/API and falls back to a local default if the API is unavailable.

---

## 1. How config is loaded

- On app start `getSiteConfig()` is called (`src/lib/siteConfig.ts`).
- Endpoint: `import.meta.env.VITE_CONFIG_API` **or** `/api/site-config`.
- On success the API JSON is shallow-merged over `defaultSiteConfig` (top-level keys; arrays are replaced wholesale).
- On failure the local `defaultSiteConfig` is used (so the site always renders).
- React components read it via the `useSiteConfig()` hook and render bilingual fields with `bi(value, lang)`.
- Changing the language (EN / नेपाली) only swaps which side of a `Bilingual` field is shown — it does **not** change the config.

### API contract (implement on your backend)

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/api/site-config` | — | The full `SiteConfig` JSON object (the `value` stored in the `site_config` row). |
| `PUT` / `POST` | `/api/site-config` | Full `SiteConfig` JSON object | Saved config (echoed back). Used by the **admin app** to persist changes. |
| `POST` | `/api/waitlist` | `{ email: string, lang?: 'en'\|'ne', source?: string }` | `{ ok: true }`. Used by the Hero form, the mobile-menu Early Access capture, and the Newsletter form. |

> The frontend stores **no** config itself; the admin app is the single writer. The frontend only `GET`s and merges over its local fallback.

### Bilingual fields
Any value typed as `Bilingual` is an object with two keys:
```ts
{ en: string; ne: string }
```
The admin panel should provide **two inputs** (English + Nepali) for every such field.

---

## 2. Config object reference

| Group | Field | Type | Notes |
|---|---|---|---|
| `brand` | `name` | `string` | Wordmark text (e.g. "Tirbeo") — shown in navbar, footer wordmark, end-of-site mark |
| | `glyph` | `string` | Lucide icon name for the logo mark (`Globe`/`Users`/`Zap`/`TrendingUp`/`MessageCircle`/`Heart`/`Share2`/`Bell`) |
| | `logoHref` | `string` (url) | Where the logo links (external `https://…` opens new tab; any other value scrolls to top) |
| `flags` | `en` | `string` (url) | USA flag image (svg) |
| | `ne` | `string` (url) | Nepal flag image (png) |
| `navbar` | `links` | `NavLink[]` | Top menu items (see below) |
| | `earlyAccess` | `object` | In-nav "Get Early Access" email capture |
| | `signup` | `NavAction` | Sign Up button → external `href` |
| | `login` | `NavAction` | Login button → external `href` |
| `hero` | `tagline` | `Bilingual` | Small eyebrow above title |
| | `title` | `Bilingual` | Main headline |
| | `cta` | `Bilingual` | Button label |
| | `placeholderEn` / `placeholderNe` | `string` | Email input placeholder (typed) |
| | `submittedEn` / `submittedNe` | `string` | Message after submit |
| `preview` | `heading` / `sub` | `Bilingual` | Section title/subtitle |
| | `appTitle` | `Bilingual` | Mock app window title |
| | `trending` / `join` / `watching` / `live` / `home` / `share` / `members` | `Bilingual` | UI labels inside the app mock |
| | `sidebar` | `SidebarItem[]` | Left nav of the app mock (icon + label + id) |
| | `communities` | `CommunityItem[]` | Trending community cards |
| | `feed` | `FeedPost[]` | Feed posts (author, text, time, stats) |
| `about` | `eyebrow` / `heading` / `scroll` | `Bilingual` | Section heading |
| | `paragraphs` | `Bilingual[]` | Body paragraphs |
| | `mission` | `Bilingual` | Mission statement |
| | `principles` | `Principle[]` | 3 principle cards (title + body) |
| `chat` | `eyebrow` / `heading` / `sub` | `Bilingual` | Section heading |
| | `features` | `Feature[]` | Feature list (icon + title + body) |
| | `gated` | `Bilingual` | Locked-area label |
| | `joinBtn` | `Bilingual` | CTA button |
| | `placeholder` | `Bilingual` | Chat input placeholder |
| | `encrypted` / `peer` | `Bilingual` | Trust badges |
| `testimonials` | `heading` / `sub` | `Bilingual` | Section heading |
| | `items` | `Testimonial[]` | Quote cards (quote + name + role + co) |
| `faq` | `eyebrow` / `heading` | `Bilingual` | Section heading |
| | `items` | `{ q: Bilingual; a: Bilingual }[]` | Q&A pairs |
| `newsletter` | `heading` / `sub` | `Bilingual` | Section heading |
| | `emailPlaceholder` / `subscribe` / `subscribed` / `spam` | `Bilingual` | Form copy |
| `footer` | `tagline` | `Bilingual` | Big footer wordmark line |
| | `rights` | `Bilingual` | Copyright line |
| | `columns` | `FooterColumn[]` | Link columns (title + links) |
| | `connect` | `ConnectLink[]` | Social links (label + icon + href) |
| | `legal` | `{ label: Bilingual; href: string }[]` | Legal links |
| `background` | `mode` | `'frames' \| 'video'` | Which background to show |
| | `videoSrc` | `string` (url) | HLS stream URL (when mode=`video`) |
| | `frameDir` | `string` | Folder of JPG frames (when mode=`frames`) |
| | `frameCount` | `number` | How many frames to preload |
| | `overlay` | `string` | Tailwind gradient overlay classes |

### `navbar.links` — dropdown structure
Each link is one of:
```ts
// simple in-page scroll link
{ key: string; label: Bilingual; target: string /* section id, e.g. 'about' */ }

// link with a dropdown panel
{
  key: string; label: Bilingual;
  dropdown: { label: Bilingual; href: string; desc?: Bilingual }[]
}
```
- `target` scrolls to a section on the page (e.g. `scrollToId('about')`).
- `dropdown[].href` can be an in-page anchor (`#community`) or an external URL.

### `navbar.earlyAccess`
```ts
{
  label: Bilingual;       // button/field label
  placeholder: Bilingual; // email input placeholder
  cta: Bilingual;         // submit button text
  success: Bilingual;     // success message
  href: string;           // where "Join" ultimately sends the user
}
```

---

## 3. Database schema

### `site_config` — single source of truth
The admin panel writes **one JSON document** that matches the config object above.

```sql
CREATE TABLE site_config (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE DEFAULT 'default', -- allows multiple locales/sites
  value       JSONB NOT NULL,                          -- the whole SiteConfig object
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  TEXT
);
```

The API `/api/site-config` returns the `value` column (the raw JSON). The frontend merges it over defaults.

### `subscribers` — captured emails (Early Access + Newsletter)
```sql
CREATE TABLE subscribers (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  source      TEXT NOT NULL DEFAULT 'early_access', -- 'early_access' | 'newsletter'
  lang        TEXT NOT NULL DEFAULT 'en',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
The navbar "Get Early Access" form and the newsletter form should POST here.

### `media` — uploaded assets (flags, backgrounds, images)
```sql
CREATE TABLE media (
  id          SERIAL PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,  -- e.g. 'flags.en', 'background.video'
  url         TEXT NOT NULL,
  kind        TEXT,                  -- 'image' | 'video' | 'flag'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4. Admin panel — recommended sections & inputs

| Panel | Inputs |
|---|---|
| **Brand** | name (text), glyph (icon picker) |
| **Flags** | en flag upload/url, ne flag upload/url |
| **Navbar** | For each link: label (EN/NE), type (scroll vs dropdown); if dropdown, repeatable items (label EN/NE, href, desc EN/NE); Early Access label/placeholder/cta/success/href (EN/NE); Sign Up href; Login href |
| **Hero** | tagline (EN/NE), title (EN/NE), cta (EN/NE), placeholder EN, placeholder NE, submitted EN, submitted NE |
| **App Preview** | heading/sub (EN/NE), appTitle, trending/join/watching/live/home/share/members (EN/NE), sidebar items (icon+label+id), communities (name+members), feed posts (author+avatar+text+time+stats) |
| **About** | eyebrow/heading/scroll/mission (EN/NE), paragraphs (repeatable EN/NE), principles (title+body EN/NE ×3) |
| **Chat** | eyebrow/heading/sub/features/gated/joinBtn/placeholder/encrypted/peer (EN/NE + icons) |
| **Testimonials** | heading/sub (EN/NE), items (quote EN/NE, name, role, co) |
| **FAQ** | eyebrow/heading (EN/NE), items (q EN/NE, a EN/NE) |
| **Newsletter** | heading/sub/emailPlaceholder/subscribe/subscribed/spam (EN/NE) |
| **Footer** | tagline/rights (EN/NE), columns (title + links), connect (label+icon+href), legal (label EN/NE + href) |
| **Background** | mode (frames/video), videoSrc, frameDir, frameCount, overlay |

Every "EN/NE" field is a **bilingual pair**. Saving the panel serializes the whole object into `site_config.value`.

---

## 5. Redirects / links behavior

- **Navbar Sign Up / Login** → open `signup.href` / `login.href` in a new tab (external accounts site).
- **Navbar dropdown items** → `href` is either an in-page anchor (`#community`, `#chat`, `#about`) or an external URL.
- **Navbar simple links** → smooth-scroll to the matching section id (`products→chat`, `solutions→about`, `resources→community`, `about→about`).
- **Early Access / Newsletter forms** → submit email to the subscribers endpoint, then show the success message (no page navigation).
- **Footer connect/legal links** → use their `href` (currently placeholders `#`).
- **Language toggle** → switches EN/नेपाली; persists choice in `localStorage`. Does not change URLs.

---

## 6. Environment variables

| Var | Purpose |
|---|---|
| `VITE_CONFIG_API` | Override the config endpoint (defaults to `/api/site-config`) |

---

## 7. Files of interest

- `src/lib/siteConfig.ts` — `SiteConfig` interface, `defaultSiteConfig`, loader & merge.
- `src/lib/useSiteConfig.ts` — `useSiteConfig()` hook + `bi()` bilingual helper.
- `src/lib/i18n.tsx` — language state (EN/NE) + `localStorage` persistence.
- `src/components/sections/Sections1.tsx` — Navbar (dropdowns, early access), Hero, AppPreview.
- `src/components/sections/Sections2.tsx` — Testimonials, Newsletter, Footer.
- `src/components/sections/Sections3.tsx` — About, Chat, FAQ.
- `src/App.tsx` — background selection (video vs frames) from config.
