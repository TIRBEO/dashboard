# Tirbeo Design System

> Dark developer-tools aesthetic. Pure near-black canvas, command-palette UI at marketing scale, Inter with ss03, white CTA pill.

## Colors

### Surface Ladder (4-step depth)
| Token | Hex | Use |
|-------|-----|-----|
| `canvas` | `#07080a` | Page background (pure near-black) |
| `surface` | `#0d0d0d` | Card backgrounds, feature cards |
| `surface-elevated` | `#101111` | Button tertiary, text inputs, pill active |
| `surface-card` | `#121212` | App icon tiles, keycaps, command-palette row hover |

### Text Hierarchy
| Token | Hex | Use |
|-------|-----|-----|
| `ink` | `#f4f4f6` | Primary headlines on dark |
| `body` | `#cdcdcd` | Default paragraph text |
| `charcoal` | `#d3d3d4` | Brighter body where ink reads soft |
| `mute` | `#9c9c9d` | Metadata, footer links, secondary captions |
| `ash` | `#6a6b6c` | Disabled-state text |
| `stone` | `#434345` | Lowest-emphasis caption |
| `on-dark` | `#ffffff` | Interactive-state primary text (buttons, focused tabs) |
| `on-dark-mute` | `rgba(255,255,255,0.72)` | Translucent secondary text |

### Brand & CTA
| Token | Hex | Use |
|-------|-----|-----|
| `primary` | `#ffffff` | Universal CTA pill background |
| `primary-pressed` | `#e8e8e8` | Pressed state |
| `on-primary` | `#000000` | Black text on white CTA |

### Borders & Hairlines
| Token | Value | Use |
|-------|-------|-----|
| `hairline` | `#242728` | Universal 1px card border |
| `hairline-soft` | `rgba(255,255,255,0.08)` | Faint border on translucent overlays |
| `hairline-strong` | `rgba(255,255,255,0.16)` | Stronger divider, focused input border |

### Semantic Accents (use only inside illustrations, NOT on chrome)
| Token | Hex | Use |
|-------|-----|-----|
| `accent-blue` | `#57c1ff` | Info, "New" pill |
| `accent-red` | `#ff6161` | Error, destructive |
| `accent-green` | `#59d499` | Success, productivity |
| `accent-yellow` | `#ffc533` | Warning, Hacker News accent |

### Hero Stripe
| Token | Hex | Use |
|-------|-----|-----|
| `hero-stripe-start` | `#ff5757` | Red gradient diagonal stripes (hero only, once per page) |
| `hero-stripe-end` | `#a1131a` | Red gradient end |

## Typography

**Font:** Inter with `font-feature-settings: "calt", "kern", "liga", "ss03"` site-wide.
The ss03 alternate `g` is the brand's signature typographic detail.

### Scale
| Token | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| `display-xl` | 64px | 600 | 1.1 | 0 |
| `display-lg` | 56px | 500 | 1.17 | 0.2px |
| `heading-xl` | 24px | 500 | 1.6 | 0.2px |
| `heading-lg` | 22px | 500 | 1.15 | 0 |
| `heading-md` | 20px | 500 | 1.4 | 0.2px |
| `heading-sm` | 18px | 500 | 1.4 | 0.2px |
| `body-lg` | 18px | 400 | 1.6 | 0 |
| `body-md` | 16px | 400 | 1.6 | 0 |
| `body-strong` | 16px | 500 | 1.4 | 0.2px |
| `body-sm` | 14px | 400 | 1.6 | 0 |
| `body-sm-strong` | 14px | 500 | 1.6 | 0.2px |
| `caption-md` | 13px | 400 | 1.4 | 0.1px |
| `caption-sm` | 12px | 400 | 1.5 | 0.4px |
| `button-md` | 14px | 500 | 1.6 | 0.2px |

## Spacing
| Token | Value |
|-------|-------|
| `xxs` | 2px |
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 24px |
| `xxl` | 32px |
| `section` | 96px |

## Border Radius
| Token | Value | Use |
|-------|-------|-----|
| `none` | 0px | Full-bleed structural surfaces |
| `xs` | 4px | Keycaps, badges |
| `sm` | 6px | Command-palette rows, inline buttons |
| `md` | 8px | Standard buttons, inputs, store cards |
| `lg` | 10px | Feature cards, pricing tiers |
| `xl` | 16px | Hero command-palette mockup container |
| `full` | 9999px | Pill tabs, avatars |

## Key Principles
1. **No drop shadows** - elevation from surface-color ladder only
2. **One dark mode** - no light variant, continuous tonal continuity
3. **White CTA pill** - universal primary action, at most one per viewport fold
4. **Hairline 1px borders** - carry every card edge, no shadows
5. **ss03 enabled** - the alternate `g` is part of the brand voice
6. **Accent colors only in illustrations** - never on chrome buttons or text
7. **Hero stripe gradient** - red diagonal stripes at top of hero, once per page max
8. **Section rhythm** - 96px vertical gap between major content blocks

## Component Tokens
- `button-primary`: white bg, black text, 14px/500/1.6, rounded-md, 8px 16px padding, 36px height
- `button-secondary`: transparent bg, white text, same type
- `button-tertiary`: surface-elevated bg, white text, same type
- `command-palette-card`: surface bg, hairline border, rounded-lg, 0 padding
- `feature-card-dark`: surface bg, hairline border, 24px padding, rounded-lg
- `feature-card-elevated`: surface-elevated bg, same as above
- `pill-tab`: transparent bg, body text, rounded-full
- `pill-tab-active`: surface-elevated bg, on-dark text, rounded-full
- `text-input`: surface-elevated bg, on-dark text, body-md type, rounded-md
