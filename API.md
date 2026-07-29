# API Reference

Base URL: `https://api.tirbeo.app/v1`

## Auth
```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/password/forgot
POST /auth/password/reset
POST /auth/2fa/verify
POST /auth/passkeys/register
POST /auth/passkeys/authenticate
```

## Users
```
GET    /users
POST   /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

## Profile
```
GET   /me
PATCH /me
```

## Roles
```
GET    /roles
POST   /roles
GET    /roles/:id
PATCH  /roles/:id
DELETE /roles/:id
```

## Applications
```
GET    /apps
POST   /apps
GET    /apps/:id
PATCH  /apps/:id
DELETE /apps/:id
```

## Support
```
GET    /tickets
POST   /tickets
GET    /tickets/:id
PATCH  /tickets/:id
```

## Content
```
GET    /blogs
POST   /blogs
GET    /blogs/:id
PATCH  /blogs/:id
DELETE /blogs/:id

GET    /pages
POST   /pages
GET    /pages/:id
PATCH  /pages/:id
```

## Audit
```
GET    /audit
GET    /audit/:id
POST   /audit/export
```

## Error Format
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission.",
    "requestId": "req_abc123"
  }
}
```
