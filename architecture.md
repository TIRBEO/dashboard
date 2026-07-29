# Tirbeo Platform Architecture

## Domain Architecture

```
tirbeo.app          — Public landing page (preserved)
account.tirbeo.app  — Identity center (auth, profile, security)
dashboard.tirbeo.app — User platform
admin.tirbeo.app    — Administration panel
api.tirbeo.app      — Central API gateway
```

## Monorepo Structure

```
tirbeo/
├── apps/
│   ├── landing/    — tirbeo.app (preserved)
│   ├── account/    — account.tirbeo.app
│   ├── dashboard/  — dashboard.tirbeo.app
│   ├── admin/      — admin.tirbeo.app
│   └── api/        — api.tirbeo.app
├── packages/
│   ├── ui/         — Design system components
│   ├── auth/       — Authentication library
│   ├── database/   — Prisma client + types
│   ├── permissions/— RBAC/ABAC engine
│   ├── validation/ — Zod schemas
│   ├── config/     — Shared configs
│   ├── types/      — Shared TypeScript types
│   └── utils/      — Shared utilities
├── infrastructure/ — Docker, nginx, deployment
└── docs/           — Architecture, API, DB docs
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Radix UI, TanStack Query, React Hook Form, Zod, Recharts
- **Backend**: Node.js, TypeScript, NestJS (modular monolith)
- **Database**: PostgreSQL via Prisma ORM
- **Cache/Queue**: Redis (BullMQ for jobs)
- **Storage**: S3-compatible (R2)
- **Auth**: Custom JWT + Argon2id + DB sessions
