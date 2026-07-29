# Role-Based Access Control

## Architecture

Permission model: `Role` → `Permission` × `Scope` × `Condition`

### Permission Format
```
{resource}.{action}
```

Examples:
- `users.read`, `users.create`, `users.suspend`, `users.delete`
- `roles.read`, `roles.create`, `roles.assign`
- `audit.read`, `audit.export`
- `billing.read`, `billing.manage`
- `blogs.read`, `blogs.create`, `blogs.publish`

### Scopes
- `GLOBAL` — Platform-wide
- `ORGANIZATION` — Org-scoped
- `TEAM` — Team-scoped
- `APPLICATION` — App-scoped
- `REGION` — Region-scoped

### Built-in Roles
Owner, Super Admin, CEO, COO, CTO, Security Admin, Trust & Safety Admin, Billing Admin, Content Admin, Support Admin, Manager, Moderator, Support Agent, Analyst, Developer, Employee, User

### Enforcement
Frontend permissions are UI hints only. Every API request enforces:
```
Authenticate → Identity → Role → Permission → Scope → Resource → Action
```
