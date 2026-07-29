# Security Architecture

## Core Principles
- Never trust frontend roles/permissions
- Every request verified server-side
- All sensitive actions audited
- Audit logs are append-only

## Authentication
- JWT-based with DB-backed sessions for revocation
- Argon2id password hashing
- TOTP 2FA support
- WebAuthn/Passkey support
- Rate limiting on auth endpoints

## Authorization
- RBAC + ABAC combined
- Permission scopes (GLOBAL, ORGANIZATION, TEAM, APPLICATION, REGION)
- Middleware enforces auth, backend enforces permissions
- Temporary roles with expiration

## Session Management
- httpOnly, Secure, SameSite cookies
- Cross-subdomain SSO via Domain=.tirbeo.app
- DB-backed sessions (revocable)
- Concurrent session limits
- Suspicious login detection

## Data Protection
- UUIDs for public IDs (no sequential IDs)
- Soft deletion where appropriate
- Retention policies
- Encryption for sensitive data
- S3-compatible storage for files
