# TIRBEO Landing

A fully **content-configurable** marketing landing page. Every visible string, link,
image and background setting is driven by a single JSON config object loaded from your
**API/DB server**. There is a separate admin app that edits that config; this repo is
the public frontend.

- Stack: **React + Vite + TypeScript**, **Tailwind CSS v4**, `lucide-react`.
- Background: 300 JPG frames played as a ping-pong video, or an HLS stream (config-driven).
- Bilingual: **English / नेपाली** toggle (persisted in `localStorage`).
- Smooth inertial scrolling, macOS-style "liquid glass" UI on a black base.

---

## 1. Project layout

```
aura-landing/
├── index.html
├── vite.config.ts            # dev server + /frames image middleware
├── public/
│   ├── flags/us.svg          # USA flag (EN toggle)
│   └── flags/np.png          # Nepal flag (NE toggle)
├── ezgif-4f16e559bf505f13-jpg/   # 300 background frames (ezgif-frame-001..300.jpg)
├── src/
│   ├── App.tsx               # provider, preloader, background selection (frames|video)
│   ├── main.tsx
│   ├── index.css             # glass styles, preloader keyframes
│   ├── lib/
│   │   ├── siteConfig.ts      # ★ SiteConfig type + defaultSiteConfig + loader (getSiteConfig)
│   │   ├── useSiteConfig.ts   # useSiteConfig() hook + bi() bilingual helper
│   │   ├── i18n.tsx           # language state (EN/NE) + localStorage
│   │   └── smoothScroll.ts    # inertial scroll
│   ├── components/
│   │   ├── CanvasBackground.tsx   # frame-sequence background
│   │   ├── BackgroundVideo.tsx    # HLS background (uses cfg.background.videoSrc)
│   │   ├── sections/
│   │   │   ├── Sections1.tsx  # Navbar (logo, links, dropdowns, lang) · Hero · AppPreview
│   │   │   ├── Sections2.tsx  # Testimonials · Newsletter+Footer
│   │   │   └── Sections3.tsx  # About · Chat · FAQ
│   │   └── ui/Primitives.tsx
└── ADMIN_CONFIG.md           # full field-by-field config + admin input map
```

---

## 2. How the frontend gets its content

At startup `getSiteConfig()` (`src/lib/siteConfig.ts`) runs:

1. Fetch `import.meta.env.VITE_CONFIG_API` **or** `/api/site-config`.
2. On success → merge the API JSON over the local `defaultSiteConfig`.
3. On failure → use the local `defaultSiteConfig` (site always renders offline).
4. Components read it via `useSiteConfig()` and render bilingual fields with `bi(value, lang)`.

Changing language only swaps the `en`/`ne` side of a field — it never changes the config.

### `Bilingual` fields
Every localized value is:
```ts
{ en: string; ne: string }
```
Your admin panel should render **two inputs** (English + Nepali) per such field.

---

## 3. API contract (your server implements this)

| Method | Path | Request body | Response |
|---|---|---|---|
| `GET` | `/api/site-config` | — | The full `SiteConfig` JSON object (the stored `value`). |
| `PUT` / `POST` | `/api/site-config` | Full `SiteConfig` JSON | Saved config echoed back. **Used by the admin app.** |
| `POST` | `/api/waitlist` | `{ email: string, lang?: "en"\|"ne", source?: string }` | `{ ok: true }`. Used by the Hero form, the mobile-menu Early Access capture, and the Newsletter form. |

The frontend is a **read-only consumer + form submitter**. The admin app is the only writer.

### Connecting to your API later
Two options:

**A. Same origin (recommended in prod)** — serve this built app behind the same host as
your API so `/api/*` resolves automatically. No env var needed.

**B. Different origin / dev** — set the endpoint via env:
```bash
# .env (project root)
VITE_CONFIG_API=https://api.yourdomain.com/api/site-config
```
The frontend will call that URL instead of `/api/site-config`. (The waitlist `POST`
still targets a relative `/api/waitlist`; if your API is on another host, proxy it or
adjust the fetch URLs in `Sections1.tsx` / `Sections2.tsx`.)

---

## 4. Database schema

Your server stores the config as **one JSON document** plus a subscribers table.

### `site_config` — single source of truth
```sql
CREATE TABLE site_config (
  id          TEXT PRIMARY KEY,            -- e.g. 'default'
  value       JSON / JSONB NOT NULL,       -- the whole SiteConfig object
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  TEXT
);
```
`GET /api/site-config` returns `value`. `PUT /api/site-config` writes `value`.

### `subscribers` — captured emails (Early Access + Newsletter)
```sql
CREATE TABLE subscribers (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  source      TEXT NOT NULL DEFAULT 'hero',   -- 'hero' | 'early_access' | 'newsletter'
  lang        TEXT NOT NULL DEFAULT 'en',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
`POST /api/waitlist` inserts here (ignore duplicate-email errors).

> Optional: a `media` table for uploaded flags / backgrounds if you want to manage
> asset URLs from the admin instead of the config JSON.

---

## 5. Config object reference

Full field list lives in **`ADMIN_CONFIG.md`**. Summary of what is editable:

| Group | What it controls |
|---|---|
| `brand` | `name`, `glyph` (logo icon), `logoHref` (where logo links) |
| `flags` | `en` / `ne` flag image URLs (language toggle) |
| `navbar` | `links` (scroll `target`, external `href`, or `dropdown` panels), `signup`/`login` (`href`), `earlyAccess` capture (label/placeholder/cta/success/href) |
| `hero` | tagline, title, cta, typed email placeholder, submitted message |
| `preview` | app-mock heading/sub, sidebar items, trending communities, feed posts |
| `about` | eyebrow/heading/paragraphs/mission/principles |
| `chat` | eyebrow/heading/sub/features/gated/joinBtn/placeholder/encrypted/peer |
| `testimonials` | heading/sub + quote cards |
| `faq` | heading + Q&A pairs |
| `newsletter` | heading/sub/emailPlaceholder/subscribe/subscribed/spam |
| `footer` | tagline, rights, link columns, connect (social), legal links |
| `background` | `mode` (`frames`\|`video`), `videoSrc` (HLS), `frameDir`, `frameCount`, `overlay` |

Every value is overridable from the DB; the local `defaultSiteConfig` is only the fallback.

---

## 6. Local development

```bash
# install
npm install

# dev (Vite) — serves the SPA; /api/* will 404 unless your API is proxied/running
npm run dev

# build
npm run build

# preview the production build
npm run preview
```

Background frames: in dev, `vite.config.ts` serves `../ezgif-4f16e559bf505f13-jpg`
at `/frames`. In production, copy those 300 JPGs to your static host under `/frames/`
(or change `background.frameDir` in the config).

Flags: place `public/flags/us.svg` and `public/flags/np.png` (Nepal flag is the official
round icon). Override URLs via `flags.en` / `flags.ne` in config.

---

## 7. Wiring checklist (connect later)

- [ ] Stand up your API with `GET/PUT /api/site-config` + `POST /api/waitlist`.
- [ ] Create `site_config` + `subscribers` tables (schema above).
- [ ] Seed `site_config.value` with the JSON exported from `defaultSiteConfig`
      (`src/lib/siteConfig.ts`) so the admin has a starting document.
- [ ] Build the admin app to read that JSON and `PUT` edits back.
- [ ] Deploy the frontend behind the same origin as the API (or set `VITE_CONFIG_API`).
- [ ] Put the 300 frames at `background.frameDir` (default `/frames/`) on the static host.

---

## 8. Notes / known details

- **Smooth scroll**: `ease = 0.035`, `accum = 55` (slow, external-scroll friendly).
- **Navbar auto-hides** after the hero (100svh) scrolls away; returns on scroll up.
- **Frames**: 300 JPGs (`ezgif-frame-001.jpg … ezgif-frame-300.jpg`) played as a
  continuous ping-pong loop site-wide on a black base.
- The frontend **never** writes config; all writes go through your admin → API → DB.
