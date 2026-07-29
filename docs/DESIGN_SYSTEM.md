# Tirbeo Design System

## 1. Core Identity

Google/Material-inspired interface with Tirbeo's own brand identity.

- **Clean, spacious, professional** — minimal shadows, clear hierarchy
- **Light-first** with full dark mode support
- **Rounded corners** — 8px controls, 12px cards, 16px dialogs
- **Accessible** — respects `prefers-reduced-motion`, high contrast ratios
- **Responsive** — mobile-first with desktop adaptation

---

## 2. Color System

### Light Mode

| Purpose | Token | Value |
|---|---|---|
| Primary | `--color-primary` | `#2563EB` (Tirbeo Blue) |
| Primary hover | `--color-primary-hover` | `#1D4ED8` |
| Primary surface | `--color-primary-surface` | `#DBEAFE` |
| Background | `--color-bg` | `#FFFFFF` |
| Secondary bg | `--color-bg-secondary` | `#F8F9FA` |
| Surface | `--color-surface` | `#FFFFFF` |
| Primary text | `--color-text` | `#202124` |
| Secondary text | `--color-text-secondary` | `#5F6368` |
| Disabled text | — | `#9AA0A6` |
| Border | `--color-border` | `#DADCE0` |
| Hover | `--color-surface-muted` | `#F1F3F4` |
| Selected | `--color-sidebar-active` | `#DBEAFE` |
| Success | `--color-success` | `#16A34A` |
| Warning | `--color-warning` | `#F59E0B` |
| Error | `--color-error` | `#DC2626` |

### Dark Mode

| Purpose | Value |
|---|---|
| Background | `#202124` |
| Surface | `#292A2D` |
| Elevated surface | `#303134` |
| Primary text | `#E8EAED` |
| Secondary text | `#9AA0A6` |
| Border | `#3C4043` |
| Primary | `#8AB4F8` |
| Success | `#81C995` |
| Warning | `#FDD663` |
| Error | `#F28B82` |

Dark mode uses adjusted hues — not inverted light values.

### App-Specific Accents

| App | Accent |
|---|---|
| Main Tirbeo | `#2563EB` |
| Social | `#7C3AED` (Purple) |
| Messages | `#0891B2` (Teal) |
| Groups | `#16A34A` (Green) |
| Support | `#F59E0B` (Yellow) |
| Billing | `#2563EB` (Blue) |
| Security | `#DC2626` (Red) |
| Developer/API | `#334155` (Slate) |
| Admin | `#1D4ED8` (Dark Blue) |

Use accents sparingly — buttons, links, selected states, small indicators only.

---

## 3. Typography

- **Primary font**: Inter
- **Fallback**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **CSS variable**: `--font-sans`

### Hierarchy

| Level | Size | Weight | Usage |
|---|---|---|---|
| Display | 36px / 44px | 600 | Marketing pages |
| Page title | 28px / 36px | 600 | Dashboard page headers |
| Section | 22px / 28px | 600 | Section headings |
| Card title | 18px / 24px | 600 | Card headers |
| Body | 14px / 20px | 400 | Default text |
| Small | 12px / 16px | 400 | Help text, metadata |

Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold). Use sparingly.

---

## 4. Spacing (8px Base)

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Tiny |
| `--space-2` | 8px | Small |
| `--space-3` | 12px | Compact |
| `--space-4` | 16px | Default |
| `--space-5` | 20px | Comfortable |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Section spacing |
| `--space-10` | 40px | Large spacing |
| `--space-12` | 48px | Major sections |
| `--space-16` | 64px | Page spacing |

UI should feel: content ↓ 24px content ↓ 32px section.

---

## 5. Border Radius

| Element | Radius | Token |
|---|---|---|
| Small controls | 8px | `--radius-md` |
| Inputs | 8px | `--radius-md` |
| Buttons | 8px (standard), pill (where appropriate) | `--radius-md` |
| Cards | 12px | `--radius-lg` |
| Dialogs | 16px | `--radius-xl` |
| Large surfaces | 20px | `--radius-2xl` |
| Avatar | 50% | `--radius-full` |

Not everything should be pill-shaped.

---

## 6. Shadows

| Surface | Value | Token |
|---|---|---|
| Card | `0 1px 2px rgba(0,0,0,0.06)` | `--shadow-card` |
| Dropdown | `0 4px 12px rgba(0,0,0,0.1)` | `--shadow-dropdown` |
| Dialog | `0 8px 28px rgba(0,0,0,0.15)` | `--shadow-dialog` |

Use borders over heavy shadows.

---

## 7. Layout

### Global Application Layout (Desktop)

```
┌──────────────────────────────────────────────────────────────┐
│ LOGO   Search...                 Help  Alerts  Avatar        │
├───────────────┬──────────────────────────────────────────────┤
│  Sidebar      │  Content                                     │
│  (240-280px)  │                                              │
│               │  Page title                         Actions  │
│   Overview    │                                              │
│   ├ Home      │  Content                                     │
│   ├ Apps      │                                              │
│   └ ...       │                                              │
│               │                                              │
│   Account     │                                              │
│   ├ Settings  │                                              │
│   └ Help      │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

| Element | Size |
|---|---|
| Top bar | 64px (`--topbar-height`) |
| Sidebar | 240-280px (`--sidebar-width`: 16rem) |
| Sidebar collapsed | 64-72px |
| Content | Flexible |
| Page max width | 1440px |

### Sidebar Section Grouping

Sections are collapsible with labels:

```
OVERVIEW
  Home
  Apps
  Activity
  Notifications

CONTENT
  My Forms

ACCOUNT
  Settings
  Security
  Privacy
  Preferences
```

### Admin Layout

More dense: tables, filters, logs, bulk actions, configuration.

### User Dashboard Layout

Simpler: welcome, KPI cards, quick actions, activity feed, notifications.

---

## 8. Components (in `@tirbeo/ui`)

All components use CSS custom properties from the theme and are available via `@tirbeo/ui`.

### Button

Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
Sizes: `sm`, `default`, `lg`, `xl`, `icon`, `iconSm`
Supports `loading` prop (shows spinner, disables interaction)

### Input

Standard text input with optional `error` string prop.
48px height (`h-12`), 8px radius, focus ring uses primary color.

### Card

`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
12px radius, border, subtle shadow.

### Badge

Variants: `default`, `secondary`, `success`, `warning`, `destructive`, `outline`
Sizes: `sm`, `default`, `lg`

### Select / Textarea

Styled select with custom chevron, textarea with min-height. Both support `error` prop.

### Toggle

Switch/toggle component. Uses `aria-checked`, supports `onChange`.

### Avatar

Circular avatar with `src`, `fallback`, `size` (sm/md/lg/xl).

### Table

`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`
Wrapped in overflow container, sticky headers.

### KpiCard

Label + value + optional trend (percentage up/down) + icon.

### Skeleton

`Skeleton`, `SkeletonCard`, `SkeletonTable` — animated loading placeholders.

### Dialog

`DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`, `DialogConfirm`
Uses escape key, click-outside-to-close, body scroll lock.

### Toast/Notification

`Toast`, `useToastManager`, `Toaster`
Types: `success`, `error`, `warning`, `info`
Auto-dismiss with configurable duration. Stacking support.

### ThemeProvider

Provides `theme` (light/dark/system) and `setTheme` via React context.
Sets `data-theme` attribute on `<html>`, persists to localStorage.

---

## 9. Forms

Every form field should include:
- Label
- Input (highlighted border on focus)
- Helper text (optional)
- Validation error (inline, red)

Destructive actions must:
- Not look identical to save/submit
- Require confirmation
- Use `variant="destructive"` on buttons

Example destructive confirmation dialog:
```
[Cancel] [Delete permanently]
```

---

## 10. Notifications

Three levels of feedback:

1. **Inline** — Form validation errors, success messages next to the action
2. **Toast** — Non-blocking, auto-dismiss, bottom-right
3. **Alert/Dialog** — Serious issues requiring user acknowledgment

---

## 11. Loading States

Prefer skeleton components over spinners:
- `SkeletonCard` for card-based layouts
- `SkeletonTable` for table-based layouts
- `Skeleton` for custom placeholders

---

## 12. Empty States

Never leave a blank page. Every empty state should include:
- An icon or illustration
- A message explaining what would appear
- A call-to-action (if applicable)

---

## 13. Mobile Adaptation

Do not shrink desktop UI. Rearrange:
- Sidebar becomes a drawer (hamburger menu)
- Multi-column layouts become single-column
- Top bar adapts with bottom navigation option
- Account/IDP apps use full-width, no card appearance

Bottom navigation tabs: Home, Search, Create, Alerts, Profile

---

## 14. Accessibility

- `prefers-reduced-motion` respected (all transitions disabled)
- Focus indicators on all interactive elements
- Color contrast meets WCAG AA (or better)
- Proper `aria-` attributes on custom controls
- Keyboard navigation supports Tab, Enter, Escape

---

## 15. Usage Across Apps

| App | Theme source | Layout |
|---|---|---|
| `landing` (Vite) | Standalone CSS | Marketing hero layout |
| `accounts` (Next.js) | Own `globals.css` | Centered IDP card, no sidebar |
| `dashboard` (Next.js) | Own `globals.css` + `@tirbeo/ui` | Sidebar + topbar |
| `admin` (Next.js) | `@tirbeo/ui/theme` planned | Dense sidebar + topbar + tables |
| `support` (Next.js) | `@tirbeo/ui/theme` planned | Sidebar + topbar + ticket layout |
| `api` (Next.js) | None (no frontend) | — |

Every new app should start with the `@tirbeo/ui` design system foundation.
