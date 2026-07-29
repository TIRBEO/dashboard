# Database Design

## Core Models

### User & Identity
- `User` — Central user record
- `Profile` — Extended profile data (1:1 with User)
- `Email` — Multiple emails per user
- `Phone` — Phone numbers
- `Credential` — Password hashes
- `Passkey` — WebAuthn credentials
- `TwoFactorMethod` — TOTP/recovery methods
- `RecoveryMethod` — Account recovery

### Sessions & Devices
- `Session` — Active user sessions
- `Device` — Known devices
- `LoginEvent` — Login history

### Organizations & Groups
- `Organization` — Multi-tenant orgs
- `OrganizationMember` — Org membership
- `Team` — Teams within orgs
- `TeamMember` — Team membership

### RBAC/ABAC
- `Role` — Named role
- `Permission` — Individual permission
- `RolePermission` — Role → Permission mapping
- `UserRole` — User → Role assignment
- `Group` — User groups
- `GroupMember` — Group membership
- `GroupRole` — Group → Role

### Applications
- `Application` — Registered apps
- `ApplicationPermission` — App-scoped permissions
- `ApplicationOAuthClient` — OAuth clients

### Notifications
- `Notification` — In-app notifications
- `NotificationPreference` — User notification settings

### Security
- `SecurityEvent` — Security-related events
- `SecurityAlert` — Alerts requiring action

### Audit
- `AuditEvent` — Append-only audit log

### Content
- `Blog` — Blog posts
- `BlogVersion` — Version history
- `BlogCategory` — Categories
- `BlogTag` — Tags
- `BlogAuthor` — Authors
- `BlogComment` — Comments
- `Page` — CMS pages
- `PageVersion` — Page version history
- `PageComponent` — Page sections

### Support
- `Ticket` — Support tickets
- `TicketMessage` — Ticket replies
- `TicketAttachment` — File attachments
- `TicketAssignment` — Agent assignments
- `SupportQueue` — Ticket queues
- `SupportAgent` — Agent config
- `SLA` — Service level agreements

### Billing
- `Plan` — Subscription plans
- `Subscription` — User subscriptions
- `Invoice` — Billing invoices
- `PaymentMethod` — Saved payment methods

### Misc
- `MediaAsset` — Uploaded files
- `ApiKey` — API keys
- `ApiClient` — OAuth clients
- `DataExport` — Export jobs
- `FeatureFlag` — Feature flags
- `Setting` — System settings
- `Job` — Background jobs
- `Incident` — System incidents
