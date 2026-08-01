-- ═════════════════════════════════════════════════════════════════════════════
-- TIRBEO PLATFORM — Complete Schema Migration
-- Fully idempotent: safe to run multiple times
-- ═════════════════════════════════════════════════════════════════════════════

-- Drop all enums first
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS organization_role CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS device_type CASCADE;
DROP TYPE IF EXISTS security_event_type CASCADE;
DROP TYPE IF EXISTS audit_action CASCADE;
DROP TYPE IF EXISTS notification_channel CASCADE;
DROP TYPE IF EXISTS notification_status CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS oauth_provider CASCADE;
DROP TYPE IF EXISTS token_type CASCADE;
DROP TYPE IF EXISTS workspace_role CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS severity_level CASCADE;

-- Drop all tables
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_emails CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS application_access CASCADE;
DROP TABLE IF EXISTS oauth_clients CASCADE;
DROP TABLE IF EXISTS oauth_consents CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS passkeys CASCADE;
DROP TABLE IF EXISTS linked_accounts CASCADE;
DROP TABLE IF EXISTS oauth_accounts CASCADE;
DROP TABLE IF EXISTS security_events CASCADE;
DROP TABLE IF EXISTS audit_events CASCADE;
DROP TABLE IF EXISTS content_reports CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_deliveries CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS form_responses CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS ticket_attachments CASCADE;
DROP TABLE IF EXISTS slas CASCADE;
DROP TABLE IF EXISTS support_queues CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS webhook_deliveries CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS blog_versions CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS page_versions CASCADE;
DROP TABLE IF EXISTS site_config CASCADE;

-- Drop site_config trigger/function
DROP TRIGGER IF EXISTS site_config_updated ON site_config;
DROP FUNCTION IF EXISTS update_site_config_timestamp();

CREATE TYPE workspace_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE session_status AS ENUM ('active', 'expired', 'revoked');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed', 'actioned');
CREATE TYPE severity_level AS ENUM ('info', 'warning', 'error', 'critical');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED');
CREATE TYPE organization_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE device_type AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'OTHER');
CREATE TYPE security_event_type AS ENUM (
  'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGIN_SUSPICIOUS',
  'PASSWORD_CHANGED', 'MFA_ENABLED', 'MFA_DISABLED',
  'PASSKEY_REGISTERED', 'PASSKEY_REMOVED',
  'SESSION_REVOKED', 'API_KEY_CREATED', 'API_KEY_REVOKED',
  'EMAIL_CHANGED', 'PHONE_CHANGED',
  'ACCOUNT_LINKED', 'ACCOUNT_UNLINKED'
);
CREATE TYPE audit_action AS ENUM (
  'USER_CREATED', 'USER_UPDATED', 'USER_SUSPENDED', 'USER_REACTIVATED',
  'USER_BANNED', 'USER_DELETED',
  'ROLE_ASSIGNED', 'ROLE_REMOVED', 'PERMISSION_CHANGED',
  'ORGANIZATION_CREATED', 'ORGANIZATION_UPDATED', 'ORGANIZATION_DELETED',
  'MEMBERSHIP_CREATED', 'MEMBERSHIP_UPDATED', 'MEMBERSHIP_REMOVED',
  'APPLICATION_CREATED', 'APPLICATION_UPDATED', 'APPLICATION_DELETED',
  'APPLICATION_ACCESS_GRANTED', 'APPLICATION_ACCESS_REVOKED',
  'SESSION_CREATED', 'SESSION_REVOKED',
  'DEVICE_REGISTERED', 'DEVICE_REVOKED',
  'PASSWORD_CHANGED', 'MFA_ENABLED', 'MFA_DISABLED',
  'PASSKEY_REGISTERED', 'PASSKEY_REMOVED',
  'API_KEY_CREATED', 'API_KEY_REVOKED',
  'SETTING_CHANGED', 'FEATURE_FLAG_CHANGED',
  'TOKEN_ISSUED', 'TOKEN_REVOKED',
  'OAUTH_CONSENT_GRANTED', 'OAUTH_CONSENT_REVOKED',
  'FORM_CREATED', 'FORM_UPDATED', 'FORM_DELETED',
  'FORM_PUBLISHED', 'FORM_ARCHIVED', 'FORM_RESPONSE_RECEIVED',
  'TICKET_CREATED', 'TICKET_UPDATED', 'TICKET_ASSIGNED',
  'TICKET_CLOSED', 'TICKET_REOPENED', 'TICKET_MESSAGE_ADDED',
  'BLOG_CREATED', 'BLOG_UPDATED', 'BLOG_DELETED', 'BLOG_PUBLISHED',
  'PAGE_CREATED', 'PAGE_UPDATED', 'PAGE_DELETED', 'PAGE_PUBLISHED',
  'CONTENT_REPORT_CREATED', 'CONTENT_REPORT_REVIEWED', 'INVOCATION'
);
CREATE TYPE notification_channel AS ENUM ('IN_APP', 'EMAIL', 'PUSH', 'SMS');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ');
CREATE TYPE job_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE oauth_provider AS ENUM ('GOOGLE', 'GITHUB', 'DISCORD', 'MICROSOFT', 'APPLE', 'CUSTOM');
CREATE TYPE token_type AS ENUM ('ACCESS', 'REFRESH', 'VERIFICATION', 'PASSWORD_RESET', 'MAGIC_LINK', 'OAUTH_STATE', 'CLI');

-- ═════════════════════════════════════════════════════════════════════════════
-- CORE USER
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE users (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email           TEXT NOT NULL UNIQUE,
  email_verified  BOOLEAN NOT NULL DEFAULT false,
  password_hash   TEXT,
  display_name    TEXT,
  avatar_url      TEXT,
  status          user_status NOT NULL DEFAULT 'ACTIVE',
  locale          TEXT NOT NULL DEFAULT 'en',
  timezone        TEXT,
  theme           TEXT NOT NULL DEFAULT 'light',
  reduced_motion  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- ═════════════════════════════════════════════════════════════════════════════
-- USER PROFILES
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE user_profiles (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT NOT NULL UNIQUE,
  first_name  TEXT,
  last_name   TEXT,
  bio         TEXT,
  location    TEXT,
  website     TEXT,
  phone       TEXT,
  company     TEXT,
  job_title   TEXT,
  pronouns    TEXT,
  birthday    DATE,
  gender      TEXT,
  social_links JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- USER EMAILS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE user_emails (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT NOT NULL,
  email       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'personal',
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  verified    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_user_emails_unique ON user_emails(user_id, email);
CREATE INDEX idx_user_emails_user_id ON user_emails(user_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- ORGANIZATIONS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE organizations (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  logo_url        TEXT,
  owner_id        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',
  settings        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- ORGANIZATION MEMBERSHIPS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE organization_memberships (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  organization_id  TEXT NOT NULL,
  user_id          TEXT NOT NULL,
  role             organization_role NOT NULL DEFAULT 'MEMBER',
  joined_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  invited_by       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_org_memberships_unique ON organization_memberships(organization_id, user_id);
CREATE INDEX idx_org_memberships_org_id ON organization_memberships(organization_id);
CREATE INDEX idx_org_memberships_user_id ON organization_memberships(user_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- APPLICATIONS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE applications (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  icon_url        TEXT,
  url             TEXT,
  status          TEXT NOT NULL DEFAULT 'active',
  version         TEXT,
  configuration   JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_applications_slug ON applications(slug);

-- ═════════════════════════════════════════════════════════════════════════════
-- APPLICATION ACCESS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE application_access (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  application_id   TEXT NOT NULL,
  user_id          TEXT NOT NULL,
  organization_id  TEXT,
  role             TEXT NOT NULL DEFAULT 'viewer',
  granted_by       TEXT NOT NULL,
  granted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_app_access_unique ON application_access(application_id, user_id, organization_id);
CREATE INDEX idx_app_access_app_id ON application_access(application_id);
CREATE INDEX idx_app_access_user_id ON application_access(user_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- OAUTH CONSENTS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE oauth_consents (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id          TEXT NOT NULL,
  client_id        TEXT NOT NULL,
  scopes           TEXT[] DEFAULT '{}',
  granted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_oauth_consents_user_id ON oauth_consents(user_id);
CREATE INDEX idx_oauth_consents_client_id ON oauth_consents(client_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- SETTINGS  (group is a reserved keyword, quoted)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE settings (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  key         TEXT NOT NULL UNIQUE,
  value       JSONB NOT NULL,
  type        TEXT NOT NULL DEFAULT 'string',
  "group"     TEXT NOT NULL DEFAULT 'general',
  label       TEXT,
  description TEXT,
  is_secret   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_group ON settings("group");

-- ═════════════════════════════════════════════════════════════════════════════
-- FEATURE FLAGS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE feature_flags (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  key         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  enabled     BOOLEAN NOT NULL DEFAULT false,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feature_flags_key ON feature_flags(key);

-- ═════════════════════════════════════════════════════════════════════════════
-- SESSIONS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE sessions (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id      TEXT NOT NULL,
  token_hash   TEXT NOT NULL UNIQUE,
  status       session_status DEFAULT 'active',
  expires_at   TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  ip_address   TEXT,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_status ON sessions(status);

-- ═════════════════════════════════════════════════════════════════════════════
-- PASSKEYS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE passkeys (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL,
  credential_id   TEXT NOT NULL UNIQUE,
  public_key      TEXT NOT NULL,
  counter         INTEGER NOT NULL DEFAULT 0,
  device_type     TEXT,
  transports      TEXT[] DEFAULT '{}',
  backup_eligible BOOLEAN DEFAULT false,
  backup_state    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at    TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ
);

CREATE INDEX idx_passkeys_user_id ON passkeys(user_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- LINKED ACCOUNTS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE linked_accounts (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id       TEXT NOT NULL,
  provider      TEXT NOT NULL,
  provider_id   TEXT NOT NULL,
  email         TEXT,
  name          TEXT,
  avatar_url    TEXT,
  access_token  TEXT,
  refresh_token TEXT,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_linked_accounts_unique ON linked_accounts(provider, provider_id);
CREATE INDEX idx_linked_accounts_user_id ON linked_accounts(user_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- SECURITY EVENTS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE security_events (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT NOT NULL,
  event_type  TEXT NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_event_type ON security_events(event_type);

-- ═════════════════════════════════════════════════════════════════════════════
-- AUDIT EVENTS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE audit_events (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  actor_id    TEXT,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  metadata    JSONB DEFAULT '{}',
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_events_actor_id ON audit_events(actor_id);
CREATE INDEX idx_audit_events_target ON audit_events(target_type, target_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at);

-- ═════════════════════════════════════════════════════════════════════════════
-- CONTENT REPORTS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE content_reports (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  reporter_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_id   TEXT NOT NULL,
  reason       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  reviewed_by  TEXT,
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_reports_reporter ON content_reports(reporter_id);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_content ON content_reports(content_type, content_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- MEDIA
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE media (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT NOT NULL,
  bucket      TEXT NOT NULL,
  path        TEXT NOT NULL,
  mime_type   TEXT,
  size_bytes  INTEGER,
  width       INTEGER,
  height      INTEGER,
  alt_text    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_media_bucket ON media(bucket);

-- ═════════════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE notifications (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT NOT NULL,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}',
  read        BOOLEAN NOT NULL DEFAULT false,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ═════════════════════════════════════════════════════════════════════════════
-- NOTIFICATION PREFERENCES
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE notification_preferences (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT NOT NULL UNIQUE,
  channels    TEXT[] DEFAULT '{in_app,email}',
  settings    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_prefs_user_id ON notification_preferences(user_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- FORMS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE forms (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT NOT NULL,
  description TEXT,
  fields      JSONB NOT NULL DEFAULT '[]',
  settings    JSONB DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'draft',
  created_by  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_forms_created_by ON forms(created_by);
CREATE INDEX idx_forms_status ON forms(status);

-- ═════════════════════════════════════════════════════════════════════════════
-- FORM RESPONSES
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE form_responses (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  form_id     TEXT NOT NULL,
  submitter_id TEXT,
  data        JSONB NOT NULL DEFAULT '{}',
  metadata    JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX idx_form_responses_submitted_at ON form_responses(submitted_at);

-- ═════════════════════════════════════════════════════════════════════════════
-- BLOG
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE blogs (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  excerpt     TEXT,
  cover_url   TEXT,
  status      TEXT NOT NULL DEFAULT 'draft',
  author_id   TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
CREATE INDEX idx_blogs_status ON blogs(status);

-- ═════════════════════════════════════════════════════════════════════════════
-- BLOG VERSIONS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE blog_versions (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  blog_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  excerpt     TEXT,
  status      TEXT NOT NULL DEFAULT 'draft',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_versions_blog_id ON blog_versions(blog_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- BLOG CATEGORIES
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE blog_categories (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);

-- ═════════════════════════════════════════════════════════════════════════════
-- PAGES
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE pages (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  content     TEXT,
  status      TEXT NOT NULL DEFAULT 'draft',
  author_id   TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_author_id ON pages(author_id);
CREATE INDEX idx_pages_status ON pages(status);

-- ═════════════════════════════════════════════════════════════════════════════
-- PAGE VERSIONS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE page_versions (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  page_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'draft',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_versions_page_id ON page_versions(page_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- TICKETS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE tickets (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  subject     TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'open',
  priority    TEXT NOT NULL DEFAULT 'medium',
  category    TEXT,
  submitter_id TEXT NOT NULL,
  assignee_id TEXT,
  sla_due_at  TIMESTAMPTZ,
  closed_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_submitter ON tickets(submitter_id);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- ═════════════════════════════════════════════════════════════════════════════
-- TICKET MESSAGES
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE ticket_messages (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  ticket_id   TEXT NOT NULL,
  sender_id   TEXT NOT NULL,
  body        TEXT NOT NULL,
  attachments JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_sender_id ON ticket_messages(sender_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- TICKET ATTACHMENTS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE ticket_attachments (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  ticket_id   TEXT NOT NULL,
  message_id  TEXT,
  url         TEXT NOT NULL,
  filename    TEXT,
  size_bytes  INTEGER,
  mime_type   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- SLAS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE slas (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT NOT NULL,
  priority    TEXT NOT NULL,
  response_time_minutes INTEGER NOT NULL,
  resolution_time_minutes INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═════════════════════════════════════════════════════════════════════════════
-- SUPPORT QUEUES
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE support_queues (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT NOT NULL,
  description TEXT,
  assignee_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═════════════════════════════════════════════════════════════════════════════
-- INTEGRATIONS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE integrations (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  config      JSONB DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'inactive',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═════════════════════════════════════════════════════════════════════════════
-- WEBHOOKS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE webhooks (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  url         TEXT NOT NULL,
  secret      TEXT,
  events      TEXT[] DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═════════════════════════════════════════════════════════════════════════════
-- WEBHOOK DELIVERIES
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE webhook_deliveries (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  webhook_id  TEXT NOT NULL,
  event       TEXT NOT NULL,
  payload     JSONB DEFAULT '{}',
  status_code INTEGER,
  response    TEXT,
  delivered_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- JOBS
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE jobs (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  type        TEXT NOT NULL,
  payload     JSONB DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'pending',
  priority    INTEGER NOT NULL DEFAULT 0,
  run_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at  TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_run_at ON jobs(run_at);

-- ═════════════════════════════════════════════════════════════════════════════
-- SITE CONFIG  (from landing migration)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS site_config (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section     text not null unique,
  data        jsonb not null default '{}'::jsonb,
  description text,
  updated_at  timestamptz not null default now()
);

CREATE OR REPLACE FUNCTION update_site_config_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

DROP TRIGGER IF EXISTS site_config_updated ON site_config;

CREATE TRIGGER site_config_updated
  BEFORE UPDATE ON site_config
  FOR EACH ROW EXECUTE FUNCTION update_site_config_timestamp();

INSERT INTO site_config (section, data, description) VALUES (
  'brand',
  '{
    "name": "Tirbeo",
    "logo": "/logo.png",
    "glyph": "Globe",
    "logoHref": "https://tirbeo.app"
  }'::jsonb,
  'Brand identity: name, logo image, icon glyph, and home link URL.'
) ON CONFLICT (section) DO NOTHING;

INSERT INTO site_config (section, data, description) VALUES (
  'navbar',
  '{
    "links": [
      { "key": "nav.products",  "label": { "en": "Products",  "ne": "उत्पादनहरू" }, "href": "https://tirbeo.app/products" },
      { "key": "nav.solutions", "label": { "en": "Solutions",  "ne": "समाधानहरू" }, "href": "https://docs.tirbeo.app/solutions" },
      { "key": "nav.docs",      "label": { "en": "Documents",  "ne": "कागजात" },     "href": "https://docs.tirbeo.app/" },
      { "key": "nav.about",     "label": { "en": "About",      "ne": "बारेमा" },     "href": "https://docs.tirbeo.app/about" }
    ],
    "signup": { "label": { "en": "Sign Up", "ne": "साइन अप" }, "href": "https://accounts.tirbeo.app/login?mode=signup" },
    "login":  { "label": { "en": "Login",   "ne": "लग इन" },   "href": "https://accounts.tirbeo.app/login" },
    "earlyAccess": {
      "label": { "en": "Get Early Access", "ne": "अर्ली एक्सेस पाउनुहोस्" },
      "placeholder": { "en": "Enter your email", "ne": "आफ्नो इमेल राख्नुहोस्" },
      "cta": { "en": "Join", "ne": "सामिल हुनुहोस्" },
      "success": { "en": "You''re on the list!", "ne": "तपाईं सूचीमा हुनुहुन्छ!" },
      "href": "https://accounts.tirbeo.app/"
    }
  }'::jsonb,
  'Navbar config: navigation links (label, href, key), signup/login buttons, early access form.'
) ON CONFLICT (section) DO NOTHING;

INSERT INTO site_config (section, data, description) VALUES (
  'hero',
  '{
    "tagline": { "en": "BUILD THE FUTURE OF SOCIAL — LAUNCHING 2027", "ne": "सामाजिक सञ्जालको भविष्य निर्माण गरौं — २०२७ मा सुरु हुँदै" },
    "title": { "en": "A new way to connect, create and belong", "ne": "जोडिने, सिर्जना गर्ने र साथी बन्ने नयाँ तरिका" },
    "cta": { "en": "Get early access", "ne": "अगाडि पहुँच पाउनुहोस्" },
    "placeholderEn": "Enter Your Email Here For Early Access",
    "placeholderNe": "अगाडि पहुँचको लागि आफ्नो इमेल लेख्नुहोस्",
    "submittedEn": "You Will Receive Notifications By Email",
    "submittedNe": "तपाईंलाई इमेलमार्फत सूचना आउनेछ"
  }'::jsonb,
  'Hero section: tagline, title, CTA button text, and email form placeholders.'
) ON CONFLICT (section) DO NOTHING;

INSERT INTO site_config (section, data, description) VALUES (
  'brand',
  '{
    "name": "Tirbeo",
    "logo": "/logo.png",
    "glyph": "Globe",
    "logoHref": "https://tirbeo.app"
  }'::jsonb,
  'Brand identity: name, logo image, icon glyph, and home link URL.'
) ON CONFLICT (section) DO NOTHING;

INSERT INTO site_config (section, data, description) VALUES (
  'brand',
  '{
    "name": "Tirbeo",
    "logo": "/logo.png",
    "glyph": "Globe",
    "logoHref": "https://tirbeo.app"
  }'::jsonb,
  'Brand identity: name, logo image, icon glyph, and home link URL.'
) ON CONFLICT (section) DO NOTHING;

INSERT INTO site_config (section, data, description) VALUES (
  'brand',
  '{
    "name": "Tirbeo",
    "logo": "/logo.png",
    "glyph": "Globe",
    "logoHref": "https://tirbeo.app"
  }'::jsonb,
  'Brand identity: name, logo image, icon glyph, and home link URL.'
) ON CONFLICT (section) DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ═════════════════════════════════════════════════════════════════════════════
