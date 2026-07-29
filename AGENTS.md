# Tirbeo Platform — Agent Memory Bank

## Project Overview

Tirbeo is a production-grade platform monorepo powering:
- `tirbeo.app` — Public landing page (preserved, Vite-based)
- `account.tirbeo.app` — Identity center (Next.js)
- `dashboard.tirbeo.app` — User platform (Next.js)
- `admin.tirbeo.app` — Admin panel (Next.js, standalone)
- `api.tirbeo.app` — Central API (Next.js + Prisma)

## Tech Stack
- **Monorepo**: pnpm + Turborepo
- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL
- **Auth**: Custom JWT (jose) + Argon2id + DB sessions
- **Packages**: `@tirbeo/ui`, `@tirbeo/auth`, `@tirbeo/database`, `@tirbeo/utils`, `@tirbeo/config`

## Project Structure
```
tirbeo/
├── apps/
│   ├── landing/      — Vite + React (preserved)
│   ├── accounts/     — Next.js auth app
│   ├── dashboard/    — Next.js user dashboard
│   ├── admin/        — Next.js standalone admin (no workspace deps)
│   ├── api/          — Next.js API with Prisma
│   └── support/      — Next.js support app
├── packages/
│   ├── auth/         — Auth provider, Supabase-based
│   ├── config/       — Shared TS/ESLint configs
│   ├── database/     — Database client + types
│   ├── ui/           — Design system components + Tailwind theme
│   └── utils/        — Domain routing, phone validation, BS dates
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── RBAC.md
│   ├── SECURITY.md
│   ├── DEPLOYMENT.md
│   └── SPIRAL_PLAN.md
└── supabase/
    └── migrations/
```

## Database (Prisma — apps/api/prisma/schema.prisma)
70+ models covering:
- **User & Identity**: User, Session, Passkey, LinkedAccount, LoginEvent
- **Auth**: Otp, RecoveryCode, TwoFactor
- **RBAC**: AppRole, UserRole, Permission
- **Organizations**: Workspace, Membership
- **Applications**: App, AppPermission, AppOAuthClient
- **Content**: Blog, BlogVersion, BlogCategory, Page, PageVersion
- **Support**: Ticket, TicketMessage, TicketAttachment, SLA, SupportQueue
- **Security**: SecurityEvent, AuditEvent, ContentReport
- **Billing**: Subscription, Plan, Invoice, PaymentMethod
- **Social**: Follow, Post, Comment, Like, Bookmark, Community, Message
- **System**: FeatureFlag, Setting, Incident, SystemService, Job

## Key Conventions
- **API auth**: Custom JWT (`__session` cookie, Domain=.tirbeo.app)
- **Prisma**: Schema in `apps/api/prisma/schema.prisma`, client in `apps/api/lib/db/prisma.ts`
- **Admin app**: Standalone deployment, calls API over HTTPS
- **Landing app**: Vite-based, preserved as-is
- **No hardcoded domains**: Use `appUrl()` from `@tirbeo/utils`
- **Admin role**: Stored in `User.adminRole` field
- **TypeScript strict mode**: `typescript.ignoreBuildErrors: true` in next.config

## Build Commands
```bash
pnpm install
pnpm dev                         # Run all apps
pnpm build                       # Build all
pnpm --filter @tirbeo/api db:generate  # Generate Prisma client
pnpm --filter @tirbeo/api seed         # Seed routes
pnpm --filter @tirbeo/api seed:defaults # Seed plans, flags, settings
```

## Recent Rebuild (2026-07-29)
- Added 20+ new Prisma models (Blog, Ticket, Page, Plan, FeatureFlag, Setting, etc.)
- Fixed all schema validation errors
- Generated Prisma client
- Removed legacy commit-files and DOCUMENTATION dirs
- Created comprehensive architecture docs
- Added seed script for default free plan + feature flags + settings
- Created `apps/api/lib/contentHandlers.ts` — Blog, Page, Settings, FeatureFlags, Plans, Apps, Incidents, Jobs handlers
- Created `apps/api/lib/supportHandlers.ts` — Ticket CRUD, messages, assign, close, reopen, queues
- Wired all new routes into `apps/api/app/api/[...slug]/route.ts`
- `api` app compiles successfully
- Created `apps/api/lib/jobs.ts` — job processor (createJob, processNextJob, completeJob, failJob, retryJob, processQueue)
- Created `apps/api/lib/health.ts` — public health check + admin detailed health (DB, Redis, queue, incidents)
- Added per-route rate limit configuration in `apps/api/lib/auth/rate-limit.ts`
- Wired health + job endpoints into API router
- All apps compile successfully

## Dashboard Rebuild (2026-07-29)
- PRD v1 119-section Dashboard specification delivered
- Full rebuild: removed old 4700-line CSS monolith, 27 old pages, mock data
- Google-inspired productivity UI with Tirbeo branding
- Foundation: Tailwind v4 + CSS custom properties design tokens (light/dark)
- Auth: `lib/auth.ts` — cookie-based session, auto-redirect to accounts.tirbeo.app
- API client: `lib/api-client.ts` — typed fetch wrapper with CSRF
- Layout: Responsive sidebar + header shell with mobile drawer
- 17 new pages rebuilt:
  - Dashboard home (greeting, quick access, activity, notifications)
  - Apps page (dynamic from API registry)
  - Activity timeline (grouped by date)
  - Notifications (read/unread, grouped Today/Yesterday/Earlier)
  - Forms page (entry point)
  - Settings hub (7 categories)
  - Account (email, username)
  - Profile (avatar, display name, bio)
  - Security (password, 2FA, active sessions)
  - Privacy (data export, account deletion)
  - Preferences (theme: light/dark/system, language, timezone)
  - Notification preferences (channels + topics toggles)
  - Connected apps page
  - Help center (search, popular topics, contact)
- All 17 pages compile successfully
