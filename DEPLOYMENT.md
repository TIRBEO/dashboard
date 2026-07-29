# Deployment

## Architecture
```
Internet → DNS (Cloudflare) → CDN/WAF → Load Balancer → App Instances → PostgreSQL/Redis/Storage
```

## DNS Records
| Record | Target |
|--------|--------|
| tirbeo.app | cname.vercel-dns.com |
| account.tirbeo.app | cname.vercel-dns.com |
| dashboard.tirbeo.app | cname.vercel-dns.com |
| admin.tirbeo.app | cname.vercel-dns.com |
| api.tirbeo.app | cname.vercel-dns.com |

## Vercel Deployments
Each app deploys as a separate Vercel project connected to the same monorepo.

## Environment Variables
Shared across apps:
- `NEXT_PUBLIC_APP_DOMAIN` — Base domain
- `NEXT_PUBLIC_API_URL` — API endpoint
- `DATABASE_URL` — PostgreSQL connection
- `REDIS_URL` — Redis connection
- `JWT_SECRET` — Token signing key
- `R2_*` — Object storage credentials
