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
- Wired all new routes into `apps/api/app/api/[...slug]/route.ts` (imports, methodMap, matchRoute, handler switch)
- `api` app compiles successfully (TypeScript errors ignored per config)
