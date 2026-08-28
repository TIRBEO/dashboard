# Tirbeo Dashboard — Improvement Suggestions

> 50 detailed proposals for features, security, UX, performance, and developer experience.

---

## 🔐 Security & Authentication (1–8)

### 1. Passkey / WebAuthn Support
**What:** Passwordless login using device biometrics (fingerprint, Face ID) or security keys (YubiKey).

**Why:** Eliminates password phishing, provides stronger auth than passwords, and is faster for users.

**Implementation:**
- Add `PublicKeyCredential` WebAuthn API calls to the accounts service
- Store credential IDs in a `passkeys` table linked to user ID
- Add "Register Passkey" button in Security settings
- Add "Sign in with Passkey" option on login page
- Support cross-device sync via cloud passkeys (Google, iCloud Keychain)

**Files affected:** `accounts` app, `security/page.tsx`, API routes

---

### 2. Login Notifications with IP + Device + Map
**What:** When a user signs in from a new device or location, send a detailed notification with IP address, device info, browser, OS, and approximate geolocation on a map.

**Why:** Users can immediately detect unauthorized access.

**Implementation:**
- On login, compare device fingerprint with known sessions
- If new device → send notification with:
  - IP address
  - Browser + OS (from user-agent)
  - Approximate city/country (from IP geolocation service)
  - "Was this you?" action button
- Store device fingerprints in session metadata

**Files affected:** Auth service, notification system, `notif-shared.tsx`

---

### 3. Session Fingerprinting
**What:** Track device/browser characteristics to detect when a session is hijacked or reused from an unexpected location.

**Implementation:**
- Collect: user-agent, screen resolution, timezone, language, platform
- Store fingerprint hash per session
- On each request, compare current fingerprint with stored one
- If mismatch → flag session, notify user, optionally revoke

**Files affected:** Session middleware, `sessions/page.tsx`

---

### 4. Rate Limiting UI
**What:** Show users when they've hit rate limits instead of silent failures.

**Implementation:**
- Detect 429 responses from API
- Show countdown timer: "Try again in 30 seconds"
- Disable submit buttons during cooldown
- Show rate limit info in API error responses

**Files affected:** `lib/api.ts`, all form pages

---

### 5. Account Recovery via SMS
**What:** Add phone number as a secondary recovery method alongside email.

**Implementation:**
- Add phone number field in Security settings
- Send OTP via SMS for recovery
- Support WhatsApp as alternative delivery channel
- Store phone number encrypted at rest

**Files affected:** Security page, API routes, DB schema

---

### 6. Security Score Dashboard
**What:** Visual security health check showing account protection level.

**Metrics:**
- ✅ Password set
- ✅ 2FA enabled
- ✅ Recovery email configured
- ✅ All sessions are known devices
- ✅ No suspicious activity in last 30 days
- ⚠️ Last password change > 90 days ago

**UI:** Progress bar (0–100) with color (red → yellow → green) and actionable suggestions.

**Files affected:** New `security/score` component, `security/page.tsx`

---

### 7. OAuth App Permissions Scope
**What:** Show exactly what data each connected app can access (read profile, read email, etc.).

**Implementation:**
- Display OAuth scopes requested by each provider
- Let users review and revoke specific scopes
- Show "Last accessed" timestamp per permission

**Files affected:** `account/apps/page.tsx`, API routes

---

### 8. Login History with Geo-Map
**What:** Visual world map showing all login locations over time.

**Implementation:**
- Geolocate IPs on login (store city, country, lat/lng)
- Render interactive map with login markers
- Click marker to see session details
- Filter by date range

**Files affected:** `security/page.tsx`, new map component

---

## 🎨 UI/UX Improvements (9–18)

### 9. Dark/Light Theme for QR Codes
**What:** QR code colors adapt to current theme (dark QR on light bg, light QR on dark bg).

**Implementation:**
- Read `data-theme` attribute from `<html>`
- Use CSS variables for QR foreground/background
- Toggle colors when theme changes

**Files affected:** `TirbeoQRCode.tsx`, `globals.css`

---

### 10. Drag-and-Drop File Upload
**What:** Native drag-drop for ticket attachments and avatar upload.

**Implementation:**
- Add `onDragOver`, `onDrop` handlers to file input areas
- Visual drop zone with border highlight
- Support multiple files
- Show upload progress per file

**Files affected:** `tickets/[id]/page.tsx`, `tickets/new/page.tsx`, `profile/page.tsx`

---

### 11. Inline Ticket Replies
**What:** Reply to tickets directly from the ticket list without opening the detail page.

**Implementation:**
- Expand ticket row on click to show message composer
- Quick reply input with send button
- Optimistic message insertion

**Files affected:** `support/tickets/page.tsx`

---

### 12. Notification Grouping
**What:** Group notifications by type (security, forms, product, support) with collapsible sections.

**Implementation:**
- Group notifications by `type` field
- Show group header with count badge
- Collapse/expand per group
- "Mark group as read" action

**Files affected:** `inbox/page.tsx`, `AppShell.tsx` notification panel

---

### 13. Keyboard Shortcuts Panel
**What:** Press `⌘+/` to show all available keyboard shortcuts.

**Implementation:**
- Create `ShortcutsPanel` component
- List all shortcuts: ⌘K (search), ⌘/ (shortcuts), Esc (close)
- Persist "don't show again" in localStorage

**Files affected:** New `components/ShortcutsPanel.tsx`, `AppShell.tsx`

---

### 14. Page Transition Animations
**What:** Smooth slide/fade transitions between dashboard pages.

**Implementation:**
- Use CSS transitions on route changes
- Fade out current page → fade in new page
- Reduce motion for `prefers-reduced-motion`

**Files affected:** `globals.css`, layout files

---

### 15. Skeleton Improvements
**What:** Realistic shimmer/shimmer effect instead of flat gray placeholders.

**Implementation:**
- Add CSS `@keyframes shimmer` animation
- Apply gradient shimmer to skeleton elements
- Match skeleton shape to actual content

**Files affected:** `Skeleton.tsx`, `globals.css`

---

### 16. Toast Stacking
**What:** Multiple toasts stack vertically instead of overwriting each other.

**Implementation:**
- Maintain toast queue (already implemented)
- Animate new toasts sliding in from right
- Max 3 visible toasts, oldest dismissed automatically

**Files affected:** `lib/toast.tsx`

---

### 17. Empty State Illustrations
**What:** Custom SVG illustrations for each empty state (no tickets, no notifications, etc.).

**Implementation:**
- Create simple, themed SVG illustrations
- Match illustration to context (envelope for inbox, lifebuoy for tickets)
- Add subtle animation

**Files affected:** New `components/illustrations/`, all empty states

---

### 18. Responsive Sidebar Collapse
**What:** Sidebar collapses to icon-only on tablet (768–1024px).

**Implementation:**
- Add CSS media query for icon-only mode
- Show tooltips on icon hover
- Toggle button to expand/collapse

**Files affected:** `globals.css`, `AppShell.tsx`

---

## 📊 Data & Analytics (19–26)

### 19. Account Activity Timeline
**What:** Visual timeline with icons for each security/account event.

**Implementation:**
- Vertical timeline with connected dots
- Icons per event type (login, password change, etc.)
- Color-coded by severity
- Expandable details per event

**Files affected:** `activity/history/page.tsx`

---

### 20. Security Audit Log
**What:** Detailed log of all security-relevant actions with filtering.

**Implementation:**
- Log all auth events, 2FA changes, password changes, session revokes
- Filter by: type, date range, severity
- Export as CSV/PDF
- Retention: 90 days (configurable)

**Files affected:** New `security/audit/page.tsx`, API routes

---

### 21. Usage Analytics Dashboard
**What:** Charts showing login frequency, feature usage, and engagement.

**Implementation:**
- Chart.js or Recharts for visualization
- Login frequency (daily/weekly/monthly)
- Feature usage breakdown
- Session duration trends

**Files affected:** New `analytics/page.tsx`

---

### 22. Data Retention Policy Page
**What:** Show what data is kept, for how long, and why.

**Implementation:**
- Table: Data type | Retention period | Purpose | Legal basis
- Notifications: 30 days
- Sessions: 90 days
- Activity logs: 90 days
- Account data: Until deletion

**Files affected:** New `privacy/retention/page.tsx`

---

### 23. Notification Delivery Stats
**What:** Show email/push delivery success rates and failures.

**Implementation:**
- Dashboard showing: sent, delivered, opened, failed
- Per-channel breakdown (email vs push)
- Recent failures with error reasons

**Files affected:** New `notifications/stats/page.tsx`

---

### 24. Ticket Response Time Metrics
**What:** Show average response time, resolution rate, and satisfaction scores.

**Implementation:**
- Calculate: first response time, resolution time
- Show trends over time
- Compare with SLA targets

**Files affected:** `support/tickets/page.tsx`

---

### 25. Export as PDF
**What:** Generate PDF reports of account data, security settings, or ticket history.

**Implementation:**
- Use `@react-pdf/renderer` or `html2pdf.js`
- Generate styled PDF from current page data
- Include headers, footers, timestamps

**Files affected:** New utility, privacy page, tickets page

---

### 26. API Usage Dashboard
**What:** Show API call volume, rate limits, and usage patterns.

**Implementation:**
- Track API calls per endpoint
- Show rate limit headers (X-RateLimit-*)
- Usage graphs by day/week/month

**Files affected:** New `account/api/page.tsx`

---

## ⚡ Performance (27–33)

### 27. Virtual Scrolling for Long Lists
**What:** Use virtualization for notifications, tickets, and activity history.

**Implementation:**
- Use `react-window` or `@tanstack/react-virtual`
- Render only visible items + buffer
- Maintain scroll position on load more

**Files affected:** `inbox/page.tsx`, `tickets/page.tsx`, `activity/history/page.tsx`

---

### 28. Image Lazy Loading
**What:** Lazy load avatars and attachments below the fold.

**Implementation:**
- Use `loading="lazy"` on `<img>` tags
- Use Next.js `<Image>` component with `priority` for above-fold
- Intersection Observer for custom lazy loading

**Files affected:** All components with images

---

### 29. Service Worker Caching
**What:** Cache API responses for offline viewing.

**Implementation:**
- Register service worker (already done)
- Cache GET requests with stale-while-revalidate
- Show "offline" banner when no network
- Queue mutations for later sync

**Files affected:** `push-client.ts`, new `sw.js`

---

### 30. Prefetch on Hover
**What:** Prefetch page data when hovering sidebar links.

**Implementation:**
- Add `onMouseEnter` handler to sidebar links
- Call `router.prefetch(href)` on hover
- Prefetch API data for the target page

**Files affected:** `AppShell.tsx` sidebar

---

### 31. Bundle Splitting
**What:** Code-split each settings page for faster initial load.

**Implementation:**
- Dynamic imports for each settings page
- Load on demand when navigating
- Shared chunks for common dependencies

**Files affected:** Next.js config, page files

---

### 32. Image Optimization
**What:** Use Next.js `<Image>` component for avatars.

**Implementation:**
- Replace `<img>` with `<Image>` for avatars
- Add `width`, `height`, `sizes` props
- Enable WebP/AVIF conversion
- Blur placeholder for loading state

**Files affected:** All avatar components

---

### 33. WebSocket Reconnection UI
**What:** Show "Reconnecting..." banner when WebSocket disconnects.

**Implementation:**
- Track WS connection state in AppShell
- Show banner with retry count
- Auto-hide when reconnected
- Manual "Retry" button

**Files affected:** `AppShell.tsx`

---

## 🧪 Testing & DX (34–41)

### 34. E2E Tests with Playwright
**What:** Test critical user flows end-to-end.

**Flows to test:**
- Login → Dashboard → Logout
- 2FA setup → Verify → Disable
- Create ticket → Reply → Close
- Profile edit → Save → Verify
- Notification toggle → Verify persistence

**Files affected:** New `e2e/` directory

---

### 35. Unit Tests for API Layer
**What:** Mock and test all `api.ts` functions.

**Implementation:**
- Mock `fetch` responses
- Test error handling (401, 403, 429, 500)
- Test retry logic
- Test CSRF token injection

**Files affected:** New `__tests__/api.test.ts`

---

### 36. Component Storybook
**What:** Visual documentation of all UI components.

**Implementation:**
- Install Storybook for Next.js
- Create stories for: Button, Card, Toggle, Badge, Skeleton, Dialog
- Show all variants and states

**Files affected:** New `.storybook/`, `stories/` directory

---

### 37. Accessibility Audit
**What:** Fix all WCAG 2.1 AA violations.

**Checklist:**
- Color contrast ratios (4.5:1 for text)
- Focus visible indicators on all interactive elements
- Form labels linked to inputs
- Error messages associated with fields
- Skip navigation link
- ARIA landmarks

**Files affected:** All components

---

### 38. Screen Reader Testing
**What:** Ensure all actions work with screen readers.

**Implementation:**
- Add `aria-label` to all icon-only buttons
- Add `aria-live` regions for dynamic content
- Test with VoiceOver (Mac) and NVDA (Windows)
- Add `role` attributes where needed

**Files affected:** All components

---

### 39. Keyboard-Only Navigation
**What:** Ensure all actions work without a mouse.

**Implementation:**
- Tab order follows visual layout
- All buttons and links reachable via Tab
- Escape closes all modals/popups
- Enter activates buttons and links
- Arrow keys navigate within menus

**Files affected:** All interactive components

---

### 40. Error Boundary Testing
**What:** Test that error boundaries catch and display errors correctly.

**Implementation:**
- Trigger errors in components
- Verify error boundary catches them
- Verify retry works
- Verify navigation away works

**Files affected:** `error.tsx` files

---

### 41. Performance Monitoring
**What:** Add Lighthouse CI to prevent performance regressions.

**Implementation:**
- Add Lighthouse CI to GitHub Actions
- Set performance budget (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Fail build if budget exceeded
- Track Core Web Vitals over time

**Files affected:** `.github/workflows/`, CI config

---

## 🌍 Internationalization (42–45)

### 42. RTL Support
**What:** Right-to-left layout for Arabic, Hebrew, and other RTL languages.

**Implementation:**
- Add `dir="rtl"` to `<html>` when RTL language selected
- Mirror CSS for RTL (use logical properties: `margin-inline-start`)
- Test all components in RTL mode

**Files affected:** `globals.css`, all components

---

### 43. Locale-Aware Date/Time Pickers
**What:** Calendar shows correct first day of week per locale.

**Implementation:**
- Monday first: most locales
- Sunday first: US, Japan, etc.
- Saturday first: Middle East

**Files affected:** `MonthCalendar.tsx`

---

### 44. Number Formatting
**What:** Locale-aware number display (1,000 vs 1.000).

**Implementation:**
- Use `Intl.NumberFormat` with locale
- Apply to: ticket counts, notification counts, file sizes

**Files affected:** All number displays

---

### 45. Translation Management
**What:** Integrate Crowdin/Weblate for community translations.

**Implementation:**
- Export strings to Crowdin
- Community members translate
- Automated PR for new translations
- Review before merge

**Files affected:** CI/CD pipeline

---

## 🔧 Advanced Features (46–50)

### 46. Webhook Management
**What:** Let users configure webhooks for events (ticket created, login, etc.).

**Implementation:**
- Webhook configuration page
- Event type selection
- URL + secret for HMAC signing
- Test webhook button
- Delivery log with retries

**Files affected:** New `account/webhooks/page.tsx`

---

### 47. API Key Management
**What:** Generate/revoke API keys for programmatic access.

**Implementation:**
- Generate random API keys (hashed storage)
- Show key once on creation
- Name + scope per key
- Revoke with confirmation
- Rate limits per key

**Files affected:** New `account/api-keys/page.tsx`

---

### 48. Audit Log Export
**What:** Download compliance-ready audit logs.

**Implementation:**
- CSV export with all fields
- JSON export for programmatic use
- PDF export for legal/compliance
- Date range filter

**Files affected:** `activity/history/page.tsx`

---

### 49. Custom Notification Rules
**What:** User-defined rules for notification routing.

**Examples:**
- "Email me when ticket is closed"
- "Push me when someone replies"
- "Daily digest instead of real-time"

**Implementation:**
- Rule builder UI (if/then)
- Store rules in preferences
- Apply rules in notification dispatch

**Files affected:** New `notifications/rules/page.tsx`

---

### 50. Multi-Account Support
**What:** Switch between multiple Tirbeo accounts without logging out.

**Implementation:**
- Store multiple session tokens
- Account switcher in header
- Visual indicator of active account
- Quick switch with keyboard shortcut

**Files affected:** `AppShell.tsx`, auth system

---

## 📋 Implementation Priority

| Phase | Items | Timeline |
|-------|-------|----------|
| **Phase 1** | #6, #13, #33, #37, #38 | 1–2 weeks |
| **Phase 2** | #4, #9, #10, #15, #16 | 2–3 weeks |
| **Phase 3** | #1, #2, #12, #19, #34 | 3–4 weeks |
| **Phase 4** | #3, #5, #11, #27, #39 | 4–6 weeks |
| **Phase 5** | #7, #8, #20, #21, #46 | 6–8 weeks |
| **Phase 6** | #42–#50 | 8–12 weeks |
