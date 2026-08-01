# Tirbeo-All Fixes Plan
Date: 2026-07-31

## 1. Fix broken login — auth/session/cookie flow
- Audit `apps/api/lib/auth/jwt.ts`, `apps/api/lib/auth/session.ts`, login handlers, middleware.
- Verify cookie domain/path/samesite/secure flags.
- Fix token generation, verification, and session lookup.
- Fix login route handlers and redirect logic.

## 2. Fix captcha glitches — challenge/verify/image routes and widget
- Audit `apps/api/lib/captcha/*`, captcha route handlers, widget component.
- Fix challenge generation, verification, and image serving.
- Ensure widget state and API calls are correct.

## 3. Fix images to use `api.tirbeo.app/image/...` endpoint
- Update all apps (landing, dashboard, admin, accounts, api, support, forms) to use the canonical image endpoint.
- Fix any localhost/proxy fallback logic.
- Verify `apps/api/app/image/[name]/route.ts` serves correctly.

## 4. Fix checkout page — images left, inputs right, professional
- Locate checkout page(s) in dashboard/apps.
- Restructure layout: image/illustration left, form inputs right.
- Apply professional styling consistent with design system.

## 5. Fix accounts page — images left, inputs right, professional
- Same layout fix for accounts pages (login, signup, recovery, etc.).
- Ensure responsive and accessible.

## 6. Add logo to admin + all sections, configurable from admin
- Update `apps/admin/app/(admin)/layout.tsx` and `DashboardShell` to render logo.
- Update branding store/config to expose logo URL.
- Add admin UI to upload/configure logo.
- Ensure all apps (dashboard, accounts, support, forms, landing) can consume logo from app-config.

## 7. Systematic 50-category security checklist audit and fix
- Create checklist covering auth, cookies, headers, input validation, SSRF, path traversal, MIME, secrets, logging, rate limiting, CORS, CSP, HSTS, permissions, dependencies, etc.
- Run through each category and fix gaps.

## 8. Add same-device multi-account detection with captcha
- Detect multiple accounts from same device/IP/browser fingerprint.
- Trigger captcha challenge on suspicious multi-account activity.
- Log events and allow admin review.

## 9. Add admin security logging with ray IDs and user details
- Create `SecurityEvent` logging middleware/handler.
- Generate ray IDs per request.
- Log user, IP, action, outcome, timestamp.
- Expose logs in admin panel.

## 10. Fix UI across admin dashboard, dashboard, all pages
- Audit all page layouts, shells, navigation, cards, forms.
- Fix alignment, spacing, typography, colors, responsive breakpoints.
- Ensure consistent use of design tokens and components.

## 11. Fix DB schema according to admin needs
- Review Prisma schema for missing fields, indexes, relations.
- Add/update models for security logs, multi-account detection, branding, etc.
- Run migrations or `db:push` safely.

## 12. Update packages to latest professional versions
- Audit `package.json` files across monorepo.
- Update to latest stable versions of Next.js, React, Prisma, Tailwind, etc.
- Verify compatibility and fix any breaking changes.

## 13. typecheck + build + commit + push
- Run `pnpm typecheck` across all packages.
- Run `pnpm build` for affected apps.
- Commit and push cleanly.
