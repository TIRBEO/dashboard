-- ════════════════════════════════════════════════════════════
-- Dashboard user settings — safe to run without 010 if users exists
-- Creates user_settings if missing; extends users + new tables
-- ════════════════════════════════════════════════════════════

-- ── Guard: users table required ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    RAISE EXCEPTION
      'public.users does not exist. Run 010_unified_platform_schema.sql first, '
      'or ensure your API Prisma schema has been pushed to this database.';
  END IF;
END $$;

-- ── Profile & identity (users) ──
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pronouns TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS open_to TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS mission TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS featured_links JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public';
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'personal';
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS delete_requested_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'inter';
ALTER TABLE users ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT 'indigo';
ALTER TABLE users ADD COLUMN IF NOT EXISTS density TEXT DEFAULT 'comfortable';
ALTER TABLE users ADD COLUMN IF NOT EXISTS sidebar_layout TEXT DEFAULT 'expanded';
ALTER TABLE users ADD COLUMN IF NOT EXISTS feed_layout TEXT DEFAULT 'card';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
  ON users(username) WHERE username IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_profile_visibility ON users(profile_visibility);

-- ── user_settings: create full table if 010 was skipped / partial ──
CREATE TABLE IF NOT EXISTS user_settings (
  id                      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id                 TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Base (from 010)
  email_digest            TEXT DEFAULT 'daily',
  digest_time             TEXT DEFAULT '08:00',
  mention_notif           BOOLEAN DEFAULT true,
  comment_notif           BOOLEAN DEFAULT true,
  report_notif            BOOLEAN DEFAULT true,
  system_notif            BOOLEAN DEFAULT true,
  marketing_notif         BOOLEAN DEFAULT false,
  push_enabled            BOOLEAN DEFAULT true,
  sound_enabled           BOOLEAN DEFAULT true,
  profile_visibility      TEXT DEFAULT 'public',
  show_online_status      BOOLEAN DEFAULT true,
  show_last_seen          BOOLEAN DEFAULT true,
  allow_mentions          BOOLEAN DEFAULT true,
  allow_dms               BOOLEAN DEFAULT true,
  sidebar_collapsed       BOOLEAN DEFAULT false,
  default_page            TEXT DEFAULT '/dashboard',
  compact_mode            BOOLEAN DEFAULT false,

  -- Dashboard extensions (011)
  channel_master          JSONB DEFAULT '{"email":true,"push":true,"in_app":true,"sms":false}'::jsonb,
  category_prefs          JSONB DEFAULT '{}'::jsonb,
  digest_frequency        TEXT DEFAULT 'daily',
  quiet_hours_start       TIME,
  quiet_hours_end         TIME,
  searchable              BOOLEAN DEFAULT true,
  show_open_to_publicly   BOOLEAN DEFAULT true,
  ad_personalization      BOOLEAN DEFAULT true,
  message_visibility      TEXT DEFAULT 'everyone',
  connections_visibility  TEXT DEFAULT 'everyone',
  show_read_receipts      BOOLEAN DEFAULT true,
  activity_broadcasting   BOOLEAN DEFAULT true,
  accessibility           JSONB DEFAULT '{}'::jsonb,
  locale                  JSONB DEFAULT '{}'::jsonb,
  general                 JSONB DEFAULT '{}'::jsonb,
  cookie_prefs            JSONB DEFAULT '{"essential":true,"analytics":false,"marketing":false}'::jsonb,

  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add extension columns when table already existed from 010
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS channel_master JSONB DEFAULT '{"email":true,"push":true,"in_app":true,"sms":false}'::jsonb;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS category_prefs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS digest_frequency TEXT DEFAULT 'daily';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS quiet_hours_start TIME;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS quiet_hours_end TIME;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS searchable BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS show_open_to_publicly BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS ad_personalization BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS message_visibility TEXT DEFAULT 'everyone';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS connections_visibility TEXT DEFAULT 'everyone';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS show_read_receipts BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS activity_broadcasting BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS accessibility JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS locale JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS general JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS cookie_prefs JSONB DEFAULT '{"essential":true,"analytics":false,"marketing":false}'::jsonb;

-- RLS for user_settings (idempotent)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_settings_own" ON user_settings;
CREATE POLICY "user_settings_own" ON user_settings
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- updated_at trigger (reuse 010 function if present, else create)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_user_settings_updated ON user_settings;
CREATE TRIGGER tr_user_settings_updated
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Blocked users ──
CREATE TABLE IF NOT EXISTS blocked_users (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  owner_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_owner ON blocked_users(owner_id);

-- ── Muted keywords ──
CREATE TABLE IF NOT EXISTS muted_keywords (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  owner_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  keyword             TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, keyword)
);

CREATE INDEX IF NOT EXISTS idx_muted_keywords_owner ON muted_keywords(owner_id);

-- ── Data export jobs ──
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'export_status') THEN
    CREATE TYPE export_status AS ENUM ('queued', 'processing', 'ready', 'expired', 'failed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS data_export_requests (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status              export_status NOT NULL DEFAULT 'queued',
  file_url            TEXT,
  expires_at          TIMESTAMPTZ,
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_data_export_user ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_status ON data_export_requests(status);

-- RLS new tables
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE muted_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocked_users_own" ON blocked_users;
CREATE POLICY "blocked_users_own" ON blocked_users
  FOR ALL USING (owner_id = auth.uid()::TEXT);

DROP POLICY IF EXISTS "muted_keywords_own" ON muted_keywords;
CREATE POLICY "muted_keywords_own" ON muted_keywords
  FOR ALL USING (owner_id = auth.uid()::TEXT);

DROP POLICY IF EXISTS "data_export_own" ON data_export_requests;
CREATE POLICY "data_export_own" ON data_export_requests
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- Auto-create user_settings row when user is created
CREATE OR REPLACE FUNCTION ensure_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_users_ensure_settings ON users;
CREATE TRIGGER tr_users_ensure_settings
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION ensure_user_settings();

-- Backfill settings rows for existing users
INSERT INTO user_settings (user_id)
SELECT id FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_settings s WHERE s.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;
