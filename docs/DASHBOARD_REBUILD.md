# Dashboard Rebuild Plan

Following PRD v1 (119 sections) — Google-inspired productivity UI with Tirbeo branding.

## Development Order (PRD §116)

| Phase | Name | Tasks |
|-------|------|-------|
| 0 | Plan | Inspect repo, document architecture, commit current state |
| 1 | Cleanup | Remove old dashboard files, reset dev DB, remove obsolete migrations |
| 2 | Foundation | Next.js config, Tailwind, design tokens, API client, auth, layout shell |
| 3 | Layout | Header, Sidebar, mobile nav, responsive shell |
| 4 | Account | Profile, Preferences, Appearance, Language, Timezone |
| 5 | Notifications | API integration, notification center, read/unread |
| 6 | Activity | Activity API, timeline, filtering |
| 7 | Security | Sessions, Devices, Security status, account-service integration |
| 8 | Apps | Application registry, Apps page, dynamic application cards |
| 9 | Privacy | Data export, Privacy preferences, Account deletion flow |
| 10 | Help | Help center, Search, Support ticket UI |
| 11 | Testing | Unit, Integration, E2E, Security, Accessibility, Performance |
| 12 | Production | Monitoring, Logging, Health checks, Deployment, Rate limits |

## Key Design Decisions

- **CSS**: Tailwind v4 with CSS variables for design tokens (PRD §7-9, §90)
- **Components**: Shared `@tirbeo/ui` package for consistency (PRD §68)
- **API client**: TanStack Query for server state (PRD §70)
- **Auth**: Cookie-based via accounts app (PRD §53)
- **No mock data**: Every visible feature must work end-to-end (PRD §111)
- **Settings layout**: Left nav + right content (PRD §96)
- **App registry**: Dynamic app registration via API (PRD §18)
- **i18n**: Prepare for localization from day 1 (PRD §43)

## Route Map (PRD §112)

```
/dashboard              Home
/dashboard/apps         Apps
/dashboard/activity     Activity
/dashboard/notifications Notifications
/dashboard/forms        Forms
/dashboard/settings     Settings hub
/dashboard/settings/account
/dashboard/settings/profile
/dashboard/settings/security
/dashboard/settings/privacy
/dashboard/settings/preferences
/dashboard/settings/notifications
/dashboard/settings/apps (connected apps)
/dashboard/help          Help center
/dashboard/help/tickets  Support tickets (future)
```
