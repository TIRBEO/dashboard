-- 
-- Tirbeo Developer Portfolio Platform - Complete SQL Schema A-Z
-- Supabase PostgreSQL - Run in SQL Editor or via migration pipeline
-- 

-- ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS achievements (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('FIRST_PROJECT','FIRST_POST','FIRST_FOLLOWER','STREAK_7','STREAK_30','CONTRIBUTOR','MAINTAINER','MENTOR','BETA_USER','EARLY_ADOPTER','CUSTOM')),
  name            TEXT NOT NULL,
  description     TEXT,
  icon            TEXT,
  badge           TEXT,
  xp_reward      INTEGER DEFAULT 0,
  earned_at       TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT achievements_user_type_unique UNIQUE (user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(type);
CREATE INDEX IF NOT EXISTS idx_achievements_earned_at ON achievements(earned_at DESC);

-- ACTIVITY LOG
CREATE TABLE IF NOT EXISTS activity_log (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id        TEXT REFERENCES auth.users(id),
  action          TEXT NOT NULL,
  entity_type     TEXT,
  entity_id       TEXT,
  metadata        JSONB DEFAULT '{}',
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor_id ON activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- API KEYS
CREATE TABLE IF NOT EXISTS api_keys (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  key_hash        TEXT NOT NULL UNIQUE,
  prefix          TEXT NOT NULL,
  last_used_at    TIMESTAMPTZ,
  usage_count     INTEGER DEFAULT 0,
  is_revoked      BOOLEAN DEFAULT FALSE,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(prefix);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  actor_id        TEXT REFERENCES auth.users(id),
  action          TEXT NOT NULL,
  entity_type     TEXT,
  entity_id       TEXT,
  metadata        JSONB DEFAULT '{}',
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- BADGES
CREATE TABLE IF NOT EXISTS badges (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL UNIQUE,
  description     TEXT,
  icon            TEXT,
  color           TEXT DEFAULT '#D8B36A',
  xp_required     INTEGER DEFAULT 0,
  is_system       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

INSERT INTO badges (name, description, icon, color, xp_required, is_system) VALUES
  ('First Steps', 'Complete your profile', '🚀', '#30d158', 10, TRUE),
  ('Builder', 'Create your first project', '🔨', '#d42a5a', 50, TRUE),
  ('Writer', 'Publish your first post', '✍️', '#64d2ff', 30, TRUE),
  ('Connector', 'Get your first follower', '🤝', '#D8B36A', 25, TRUE),
  ('Streak Master', '7-day posting streak', '🔥', '#ff453a', 200, TRUE),
  ('Open Source', 'Publish an open-source project', '🌐', '#238636', 100, TRUE),
  ('Mentor', 'Help 10 developers', '🎓', '#ffd60a', 500, TRUE),
  ('Veteran', '1 year on Tirbeo', '⭐', '#ffd60a', 1000, TRUE),
  ('Legend', 'Top 1% developer', '🏆', '#ffd60a', 10000, TRUE)
ON CONFLICT (name) DO NOTHING;

-- BILLING
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan            TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','team','enterprise')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','past_due','canceled','trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  canceled_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_user_id ON billing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing_subscriptions(status);

-- BLOCKLIST
CREATE TABLE IF NOT EXISTS blocklist (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT blocklist_unique UNIQUE (user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_blocklist_user ON blocklist(user_id);
CREATE INDEX IF NOT EXISTS idx_blocklist_blocked ON blocklist(blocked_user_id);

-- BOOKMARKS
CREATE TABLE IF NOT EXISTS bookmarks (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type     TEXT NOT NULL CHECK (entity_type IN ('project','post','startup','community')),
  entity_id       TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT bookmarks_unique UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_entity ON bookmarks(entity_type, entity_id);

-- COMMUNITIES
CREATE TABLE IF NOT EXISTS communities (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  avatar_url      TEXT,
  cover_url       TEXT,
  category        TEXT,
  is_public       BOOLEAN DEFAULT TRUE,
  member_count    INTEGER DEFAULT 0,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_user_id ON communities(user_id);
CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(category);

-- COMMUNITY MEMBERS
CREATE TABLE IF NOT EXISTS community_members (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  community_id    TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','moderator','member')),
  joined_at       TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT community_members_unique UNIQUE (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);

-- COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  content         TEXT NOT NULL,
  author_id       TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type     TEXT NOT NULL CHECK (entity_type IN ('project','post','startup','community','comment')),
  entity_id       TEXT NOT NULL,
  parent_id       TEXT REFERENCES comments(id) ON DELETE CASCADE,
  like_count      INTEGER DEFAULT 0,
  is_edited       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- CONNECTED ACCOUNTS (OAuth)
CREATE TABLE IF NOT EXISTS connected_accounts (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL CHECK (provider IN ('github','linkedin','twitter','google','discord','stackoverflow')),
  provider_id     TEXT NOT NULL,
  access_token    TEXT,
  refresh_token   TEXT,
  profile_url     TEXT,
  avatar_url      TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT connected_accounts_unique UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_provider ON connected_accounts(provider);

-- DISTRICTS (Nepal)
CREATE TABLE IF NOT EXISTS districts (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,
  province        INTEGER CHECK (province BETWEEN 1 AND 7)
);

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  event_type      TEXT NOT NULL CHECK (event_type IN ('hackathon','meetup','deadline','workshop','conference')),
  location        TEXT,
  is_online       BOOLEAN DEFAULT FALSE,
  url             TEXT,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ,
  max_attendees   INTEGER,
  attendee_count  INTEGER DEFAULT 0,
  organizer_id    TEXT REFERENCES auth.users(id),
  is_published    BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);

-- EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS event_registrations (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  event_id        TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at   TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT event_registrations_unique UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_regs_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_regs_user ON event_registrations(user_id);

-- EXPERIENCE (Resume)
CREATE TABLE IF NOT EXISTS experiences (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company         TEXT NOT NULL,
  role            TEXT NOT NULL,
  location        TEXT,
  start_date      DATE,
  end_date        DATE,
  is_current      BOOLEAN DEFAULT FALSE,
  description     TEXT,
  url             TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiences_user_id ON experiences(user_id);

-- EDUCATION (Resume)
CREATE TABLE IF NOT EXISTS education (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution     TEXT NOT NULL,
  degree          TEXT,
  field_of_study  TEXT,
  start_date      DATE,
  end_date        DATE,
  is_current      BOOLEAN DEFAULT FALSE,
  gpa             TEXT,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);

-- EXTERNAL ACCOUNTS
CREATE TABLE IF NOT EXISTS external_accounts (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL CHECK (platform IN ('github','linkedin','twitter','website','dribbble','behance','figma','codepen','hashnode','devto','freecodecamp','leetcode','hackerrank','codeforces','atcoder')),
  username        TEXT,
  url             TEXT NOT NULL,
  is_verified     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT external_accounts_user_platform_unique UNIQUE (user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_external_accounts_user ON external_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_external_accounts_platform ON external_accounts(platform);

-- FOLLOWS (Social Graph)
CREATE TABLE IF NOT EXISTS follows (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  follower_id     TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id    TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT follows_follower_following_unique UNIQUE (follower_id, following_id),
  CONSTRAINT follows_not_self CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- FEATURE REQUESTS
CREATE TABLE IF NOT EXISTS feature_requests (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT REFERENCES auth.users(id),
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewing','planned','implemented','rejected')),
  votes           INTEGER DEFAULT 0,
  category        TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_votes ON feature_requests(votes DESC);

-- GOALS
CREATE TABLE IF NOT EXISTS goals (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT DEFAULT 'personal',
  target_value    INTEGER,
  current_value   INTEGER DEFAULT 0,
  is_completed    BOOLEAN DEFAULT FALSE,
  started_at      DATE,
  target_date     DATE,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(is_completed);

-- HACKATHON PARTICIPATIONS
CREATE TABLE IF NOT EXISTS hackathon_participations (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  hackathon_id    TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      TEXT REFERENCES projects(id) ON DELETE SET NULL,
  role            TEXT,
  team_name       TEXT,
  status          TEXT DEFAULT 'registered' CHECK (status IN ('registered','confirmed','withdrawn','awarded')),
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT hackathon_participations_unique UNIQUE (hackathon_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_hackathon_parts_event ON hackathon_participations(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_parts_user ON hackathon_participations(user_id);

-- INTEGRATIONS
CREATE TABLE IF NOT EXISTS integrations (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  provider        TEXT NOT NULL CHECK (provider IN ('vercel','netlify','railway','render','docker','aws','gcp','azure','github_actions','circleci','github_pages','cloudflare','discord','slack','notion','figma','cursor','copilot')),
  config          JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);

-- INVITATIONS
CREATE TABLE IF NOT EXISTS invitations (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  inviter_id      TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email   TEXT NOT NULL,
  invitee_name    TEXT,
  community_id    TEXT REFERENCES communities(id) ON DELETE CASCADE,
  workspace_id    TEXT,
  role            TEXT DEFAULT 'member',
  token           TEXT NOT NULL UNIQUE,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','revoked')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  responded_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(invitee_email);

-- INVITE ACCEPTANCES
CREATE TABLE IF NOT EXISTS invitation_acceptances (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  invitation_id   TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES auth.users(id),
  accepted_at     TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT invitation_acceptances_unique UNIQUE (invitation_id, user_id)
);

-- LIKES
CREATE TABLE IF NOT EXISTS likes (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type     TEXT NOT NULL CHECK (entity_type IN ('project','post','comment','startup')),
  entity_id       TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT likes_user_entity_unique UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_entity ON likes(entity_type, entity_id);

-- LANGUAGES (User Skills)
CREATE TABLE IF NOT EXISTS user_languages (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language        TEXT NOT NULL,
  proficiency     TEXT NOT NULL CHECK (proficiency IN ('native','fluent','intermediate','basic')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_language ON user_languages(language);

-- LEARNING PATHS
CREATE TABLE IF NOT EXISTS learning_paths (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  skills          TEXT[] DEFAULT '{}',
  progress        INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  is_completed    BOOLEAN DEFAULT FALSE,
  started_at      DATE,
  completed_at    DATE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_progress ON learning_paths(progress DESC);

-- LINKS (User Social Links)
CREATE TABLE IF NOT EXISTS user_links (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL,
  url             TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT user_links_user_platform_unique UNIQUE (user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_user_links_user_id ON user_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_links_platform ON user_links(platform);

-- MESSAGES (Direct Messages)
CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  conversation_id TEXT NOT NULL,
  sender_id       TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  message_type    TEXT DEFAULT 'text' CHECK (message_type IN ('text','image','file','code','system')),
  file_url        TEXT,
  file_name       TEXT,
  file_size       INTEGER,
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  reply_to        TEXT REFERENCES messages(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);

-- MESSENGER CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  type            TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct','group')),
  name            TEXT,
  avatar_url      TEXT,
  last_message_at TIMESTAMPTZ,
  created_by      TEXT REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- CONVERSATION MEMBERS
CREATE TABLE IF NOT EXISTS conversation_members (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at    TIMESTAMPTZ,
  joined_at       TIMESTAMPTZ DEFAULT now(),
  is_notifications_enabled BOOLEAN DEFAULT TRUE,

  CONSTRAINT conversation_members_unique UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members(user_id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('follow','like','comment','mention','project_invite','achievement','system','message')),
  title           TEXT NOT NULL,
  body            TEXT,
  link            TEXT,
  actor_id        TEXT REFERENCES auth.users(id),
  entity_type     TEXT,
  entity_id       TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS notification_preferences (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_followers BOOLEAN DEFAULT TRUE,
  email_mentions  BOOLEAN DEFAULT TRUE,
  email_likes     BOOLEAN DEFAULT TRUE,
  email_comments  BOOLEAN DEFAULT TRUE,
  push_followers  BOOLEAN DEFAULT TRUE,
  push_mentions   BOOLEAN DEFAULT TRUE,
  push_likes      BOOLEAN DEFAULT TRUE,
  push_comments   BOOLEAN DEFAULT TRUE,
  in_app_all      BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ONLINE PRESENCE
CREATE TABLE IF NOT EXISTS online_presence (
  user_id         TEXT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online','away','busy','offline')),
  last_seen_at    TIMESTAMPTZ DEFAULT now(),
  device          TEXT,
  ip_address      INET,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- PASSKEYS
CREATE TABLE IF NOT EXISTS passkeys (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT,
  public_key      BYTEA NOT NULL,
  credential_id   BYTEA NOT NULL,
  counter         BIGINT DEFAULT 0,
  device_type     TEXT,
  browser         TEXT,
  is_primary      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT passkeys_user_name_unique UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkeys(user_id);

-- PASSKEY CHALLENGES (for WebAuthn flow)
CREATE TABLE IF NOT EXISTS passkey_challenges (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge       BYTEA NOT NULL,
  origin          TEXT,
  type            TEXT NOT NULL DEFAULT 'registration',
  is_used         BOOLEAN DEFAULT FALSE,
  expires_at      TIMESTAMPTZ DEFAULT (now() + INTERVAL '5 minutes'),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_passkey_challenges_user ON passkey_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_passkey_challenges_expires ON passkey_challenges(expires_at);

- POST TAGS & HASHTAGS
CREATE TABLE IF NOT EXISTS post_tags (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  use_count       INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_hashtags (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  post_id         TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id          TEXT NOT NULL REFERENCES post_tags(id) ON DELETE CASCADE,

  CONSTRAINT post_hashtags_unique UNIQUE (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_hashtags_post ON post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_tag ON post_hashtags(tag_id);

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  content         TEXT,
  github_url      TEXT,
  demo_url        TEXT,
  language        TEXT,
  category        TEXT DEFAULT 'other',
  visibility      TEXT DEFAULT 'public' CHECK (visibility IN ('public','private','unlisted')),
  is_startup      BOOLEAN DEFAULT FALSE,
  pinned          BOOLEAN DEFAULT FALSE,
  star_count      INTEGER DEFAULT 0,
  fork_count      INTEGER DEFAULT 0,
  view_count      INTEGER DEFAULT 0,
  thumbnail_url   TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON projects(visibility);
CREATE INDEX IF NOT EXISTS idx_projects_stars ON projects(star_count DESC);
CREATE INDEX IF NOT EXISTS idx_projects_views ON projects(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- PROJECT TAGS
CREATE TABLE IF NOT EXISTS project_tags (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  project_id      TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  CONSTRAINT project_tags_unique UNIQUE (project_id, name)
);

CREATE INDEX IF NOT EXISTS idx_project_tags_project ON project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_name ON project_tags(name);

-- PROFILE VIEWS (Analytics)
CREATE TABLE IF NOT EXISTS profile_views (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  viewer_id       TEXT REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id      TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_agent      TEXT,
  ip_address      INET,
  referrer        TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON profile_views(created_at DESC);

-- PROFILES (Extended User Profile)
CREATE TABLE IF NOT EXISTS profiles (
  id              TEXT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE,
  full_name       TEXT,
  avatar_url      TEXT,
  headline        TEXT,
  bio             TEXT,
  location        TEXT,
  website         TEXT,
  github          TEXT,
  linkedin        TEXT,
  twitter         TEXT,
  skills          TEXT[] DEFAULT '{}',
  languages       TEXT[] DEFAULT '{}',
  role            TEXT,
  company         TEXT,
  education       TEXT,
  portfolio_url   TEXT,
  resume_url      TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_banned       BOOLEAN DEFAULT FALSE,
  is_suspended    BOOLEAN DEFAULT FALSE,
  karma_points    INTEGER DEFAULT 0,
  views_count     INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  projects_count  INTEGER DEFAULT 0,
  posts_count     INTEGER DEFAULT 0,
  streak_days     INTEGER DEFAULT 0,
  last_streak_at  DATE,
  xp              INTEGER DEFAULT 0,
  level           INTEGER DEFAULT 1,
  privacy_profile_visibility TEXT DEFAULT 'public' CHECK (privacy_profile_visibility IN ('public','followers','private')),
  privacy_activity_status TEXT DEFAULT 'visible' CHECK (privacy_activity_status IN ('visible','hidden','offline_only')),
  privacy_search_visibility BOOLEAN DEFAULT TRUE,
  theme           TEXT DEFAULT 'system',
  accent_color    TEXT DEFAULT 'crimson',
  font_family     TEXT DEFAULT 'inter',
  font_size       TEXT DEFAULT 'default',
  reduced_motion  BOOLEAN DEFAULT FALSE,
  high_contrast   BOOLEAN DEFAULT FALSE,
  sidebar_layout  TEXT DEFAULT 'expanded',
  feed_layout     TEXT DEFAULT 'card',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_proviews_karma ON profiles(karma_points DESC);

-- PROFILE ACHIEVEMENTS (Many-to-Many)
CREATE TABLE IF NOT EXISTS profile_achievements (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  profile_id      TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id  TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  awarded_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT profile_achievements_unique UNIQUE (profile_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_achievements_profile ON profile_achievements(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_achievements_achievement ON profile_achievements(achievement_id);

-- PROJECT MEMBERS
CREATE TABLE IF NOT EXISTS project_members (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  project_id      TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'contributor' CHECK (role IN ('owner','collaborator','contributor','viewer')),
  invited_at      TIMESTAMPTZ DEFAULT now(),
  joined_at       TIMESTAMPTZ,

  CONSTRAINT project_members_unique UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- PROJECT COLLABORATIONS (for real-time collab app)
CREATE TABLE IF NOT EXISTS project_collaborations (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  project_id      TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cursor_position JSONB,
  cursor_color    TEXT,
  last_activity   TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT project_collab_unique UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_collab_project ON project_collaborations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collab_user ON project_collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_project_collab_last_activity ON project_collaborations(last_activity DESC);

-- REPORTS (Content Moderation)
CREATE TABLE IF NOT EXISTS reports (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  reporter_id     TEXT NOT NULL REFERENCES auth.users(id),
  entity_type     TEXT NOT NULL CHECK (entity_type IN ('post','comment','project','user','community')),
  entity_id       TEXT NOT NULL,
  reason          TEXT NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','action_taken','dismissed')),
  moderator_id    TEXT REFERENCES auth.users(id),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_entity ON reports(entity_type, entity_id);

-- RESUMES
CREATE TABLE IF NOT EXISTS resumes (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  content         JSONB NOT NULL DEFAULT '{}',
  is_template     BOOLEAN DEFAULT FALSE,
  template_id     TEXT,
  version         INTEGER DEFAULT 1,
  is_published    BOOLEAN DEFAULT FALSE,
  download_count  INTEGER DEFAULT 0,
  view_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_slug ON resumes(slug);

-- ROLES
CREATE TABLE IF NOT EXISTS roles (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL UNIQUE,
  description     TEXT,
  color           TEXT DEFAULT '#D8B36A',
  icon            TEXT,
  is_system       BOOLEAN DEFAULT FALSE,
  permissions     JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ROLE ASSIGNMENTS
CREATE TABLE IF NOT EXISTS role_assignments (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id         TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by     TEXT REFERENCES auth.users(id),
  assigned_at     TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT role_assignments_unique UNIQUE (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_role_assignments_user ON role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_role ON role_assignments(role_id);

-- SEARCH INDEX (Materialized View for full-text search)
CREATE TABLE IF NOT EXISTS search_index (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  entity_type     TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  title           TEXT,
  description     TEXT,
  keywords        TEXT[] DEFAULT '{}',
  category        TEXT,
  slug            TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_index_entity ON search_index(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_search_index_title ON search_index USING gin(to_tsvector('english', coalesce(title, '')));
CREATE INDEX IF NOT EXISTS idx_search_index_keywords ON search_index USING gin(unnest(keywords));

-- SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash      TEXT NOT NULL UNIQUE,
  refresh_token   TEXT,
  ip_address      INET,
  user_agent      TEXT,
  device          TEXT,
  platform        TEXT,
  is_revoked      BOOLEAN DEFAULT FALSE,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- SKILLS
CREATE TABLE IF NOT EXISTS skills (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL UNIQUE,
  category        TEXT,
  description     TEXT,
  popularity      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_popularity ON skills(popularity DESC);

-- SKILL RATINGS (User proficiency per skill)
CREATE TABLE IF NOT EXISTS skill_ratings (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id        TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level           INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  years_experience REAL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT skill_ratings_user_skill_unique UNIQUE (user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_ratings_user ON skill_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_ratings_skill ON skill_ratings(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_ratings_level ON skill_ratings(level DESC);

-- STARTUPS
CREATE TABLE IF NOT EXISTS startups (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  stage           TEXT DEFAULT 'idea' CHECK (stage IN ('idea','mvp','seed','growth','scale')),
  funding         TEXT,
  industry        TEXT,
  website         TEXT,
  logo_url        TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_hiring       BOOLEAN DEFAULT FALSE,
  member_count    INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id);
CREATE INDEX IF NOT EXISTS idx_startups_stage ON startups(stage);
CREATE INDEX IF NOT EXISTS idx_startups_slug ON startups(slug);

-- STARTUP MEMBERS
CREATE TABLE IF NOT EXISTS startup_members (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  startup_id      TEXT NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member' CHECK (role IN ('founder','cofounder','member','advisor')),
  joined_at       TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT startup_members_unique UNIQUE (startup_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_startup_members_startup ON startup_members(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_members_user ON startup_members(user_id);

-- SUBSCRIPTIONS (Billing)
CREATE TABLE IF NOT EXISTS subscriptions (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan            TEXT NOT NULL CHECK (plan IN ('free','pro','team','enterprise')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','past_due','canceled','trialing','expired')),
  stripe_customer_id   TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  trial_ends_at       TIMESTAMPTZ,
  canceled_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT subscriptions_user_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- SUPPORT TICKETS (Admin Chat)
CREATE TABLE IF NOT EXISTS support_tickets (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT REFERENCES auth.users(id) ON DELETE SET NULL,
  subject         TEXT NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'open' CHECK (status IN ('open','pending','in_progress','resolved','closed')),
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  category        TEXT DEFAULT 'general' CHECK (category IN ('general','bug','feature','billing','account','technical')),
  assigned_to     TEXT REFERENCES auth.users(id),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);

-- TICKET MESSAGES (Admin Chat)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  ticket_id       TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id       TEXT NOT NULL REFERENCES auth.users(id),
  sender_role     TEXT NOT NULL DEFAULT 'user' CHECK (sender_role IN ('user','admin','moderator', 'support')),
  content         TEXT NOT NULL,
  attachments     JSONB DEFAULT '[]',
  is_internal     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender ON ticket_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at DESC);

-- TAGS (Project/Post Tags)
CREATE TABLE IF NOT EXISTS tags (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  category        TEXT,
  use_count       INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);

-- TEAM_MEMBERS (Workspace)
CREATE TABLE IF NOT EXISTS team_members (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  workspace_id    TEXT NOT NULL,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
  joined_at       TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT team_members_unique UNIQUE (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_workspace ON team_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- TIMELINE ENTRIES
CREATE TABLE IF NOT EXISTS timeline_entries (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  icon            TEXT,
  color           TEXT DEFAULT '#D8B36A',
  date            DATE,
  url             TEXT,
  type            TEXT DEFAULT 'milestone' CHECK (type IN ('milestone','experience','education','achievement','certification')),
  is_featured     BOOLEAN DEFAULT FALSE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_user_id ON timeline_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_sort ON timeline_entries(sort_order);

- TO-DO / TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done','archived')),
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  due_date        DATE,
  category        TEXT DEFAULT 'personal',
  tags            TEXT[] DEFAULT '{}',
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- TRANSACTIONS (Billing)
CREATE TABLE IF NOT EXISTS transactions (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT,
  amount          INTEGER NOT NULL,
  currency        TEXT DEFAULT 'USD',
  type            TEXT NOT NULL CHECK (type IN ('subscription','topup','refund','one_time')),
  description     TEXT,
  status          TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','refunded')),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe ON transactions(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- THEMES (User preferences)
CREATE TABLE IF NOT EXISTS themes (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL,
  mode            TEXT NOT NULL CHECK (mode IN ('dark','light','system')),
  config          JSONB DEFAULT '{}',
  is_default      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

INSERT INTO themes (name, display_name, mode, config, is_default) VALUES
  ('tirbeo-dark', 'Tirbeo Dark', 'dark', '{"bg":"#000000","surface":"#1c1c1e","accent":"#ffffff"}', TRUE),
  ('tirbeo-light', 'Tirbeo Light', 'light', '{"bg":"#ffffff","surface":"#fafafa","accent":"#0a0a0a"}', FALSE)
ON CONFLICT (name) DO NOTHING;

-- TIMELINE OF USER ACTIVITY TRACKER
CREATE TABLE IF NOT EXISTS user_activity_timeline (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type   TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  metadata        JSONB DEFAULT '{}',
  score           INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_timeline_user ON user_activity_timeline(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_timeline_type ON user_activity_timeline(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_timeline_created_at ON user_activity_timeline(created_at DESC);

-- USAGE METRICS
CREATE TABLE IF NOT EXISTS usage_metrics (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature         TEXT NOT NULL,
  action          TEXT NOT NULL,
  count           INTEGER DEFAULT 1,
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT usage_metrics_user_feature_period_unique UNIQUE (user_id, feature, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_user ON usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_feature ON usage_metrics(feature);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON usage_metrics(period_start, period_end);

-- USER BLOCKLIST
CREATE TABLE IF NOT EXISTS user_blocklist (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  blocker_id      TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id      TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT user_blocklist_unique UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocklist_blocker ON user_blocklist(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocklist_blocked ON user_blocklist(blocked_id);

-- USER ROLES (RBAC)
CREATE TABLE IF NOT EXISTS user_roles (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('super_admin','admin','moderator','editor','member','premium','free')),
  assigned_by     TEXT REFERENCES auth.users(id),
  assigned_at     TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- VERIFICATIONS (Email, Phone, Identity)
CREATE TABLE IF NOT EXISTS verifications (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('email','phone','identity','document'))
  purpose         TEXT NOT NULL CHECK (purpose IN ('signup','login','password_reset','email_change','phone_change','kyc')),
  token           TEXT NOT NULL UNIQUE,
  otp             TEXT,
  attempts        INTEGER DEFAULT 0,
  max_attempts    INTEGER DEFAULT 5,
  is_verified     BOOLEAN DEFAULT FALSE,
  verified_at     TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verifications_token ON verifications(token);
CREATE INDEX IF NOT EXISTS idx_verifications_user_type ON verifications(user_id, type);
CREATE INDEX IF NOT EXISTS idx_verifications_expires ON verifications(expires_at);

-- VIEWS (Content View Analytics)
CREATE TABLE IF NOT EXISTS views (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type     TEXT NOT NULL CHECK (entity_type IN ('project','post','startup','profile','community')),
  entity_id       TEXT NOT NULL,
  ip_address      INET,
  user_agent      TEXT,
  referrer        TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_views_entity ON views(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_views_user ON views(user_id);
CREATE INDEX IF NOT EXISTS idx_views_created_at ON views(created_at DESC);

-- VOTES (Polls / Community Voting)
CREATE TABLE IF NOT EXISTS votes (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type     TEXT NOT NULL CHECK (entity_type IN ('poll','proposal','feature_request','content')),
  entity_id       TEXT NOT NULL,
  option          TEXT,
  value           INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT votes_user_entity_unique UNIQUE (user_id, entity_type, entity_id, option)
);

CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_entity ON votes(entity_type, entity_id);

-- WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  logo_url        TEXT,
  owner_id        TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan            TEXT DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise')),
  is_archived     BOOLEAN DEFAULT FALSE,
  member_count    INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);

-- XP LEDGER (Points History)
CREATE TABLE IF NOT EXISTS xp_ledger (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action          TEXT NOT NULL,
  xp_amount       INTEGER NOT NULL,
  balance_after   INTEGER NOT NULL DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_id ON xp_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_created_at ON xp_ledger(created_at DESC);

-- YEARLY MILESTONES
CREATE TABLE IF NOT EXISTS yearly_milestones (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year            INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  total_xp        INTEGER DEFAULT 0,
  projects_count  INTEGER DEFAULT 0,
  posts_count     INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  streak_max      INTEGER DEFAULT 0,
  achievements_count INTEGER DEFAULT 0,
  rank            TEXT DEFAULT 'bronze',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT yearly_milestones_user_year_unique UNIQUE (user_id, year)
);

CREATE INDEX IF NOT EXISTS idx_yearly_milestones_user ON yearly_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_yearly_milestones_year ON yearly_milestones(year DESC);

-- ZIPPER (Compressed Profile Data for Export)
CREATE TABLE IF NOT EXISTS data_exports (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('profile','projects','posts','all')),
  format          TEXT NOT NULL DEFAULT 'json' CHECK (format IN ('json','csv','pdf')),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','ready','failed')),
  file_url        TEXT,
  file_size       BIGINT,
  expires_at      TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  created_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_data_exports_user_id ON data_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_status ON data_exports(status);

-- Z-INDEX CACHE (Performance)
CREATE TABLE IF NOT EXISTS zindex_cache (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  cache_key       TEXT NOT NULL UNIQUE,
  cache_value     JSONB NOT NULL DEFAULT '{}',
  ttl_seconds     INTEGER DEFAULT 300,
  created_at      TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ DEFAULT (now() + INTERVAL '5 minutes')
);

CREATE INDEX IF NOT EXISTS idx_zindex_cache_key ON zindex_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_zindex_cache_expires ON zindex_cache(expires_at);

-- 
-- HELPER: Refresh materialized search index
-- 
CREATE OR REPLACE FUNCTION refresh_search_index()
RETURNS void AS $$
BEGIN
  -- Refresh project search
  INSERT INTO search_index (entity_type, entity_id, title, description, keywords, category, slug)
  SELECT 'project', p.id, p.title, LEFT(p.description, 200), ARRAY[p.language, p.category, p.title], p.category, NULL
  FROM projects p
  ON CONFLICT (entity_type, entity_id) DO UPDATE
    SET title = EXCLUDED.title, description = EXCLUDED.description,
        keywords = EXCLUDED.keywords, category = EXCLUDED.category, slug = EXCLUDED.slug,
        updated_at = now();

  -- Refresh post search
  INSERT INTO search_index (entity_type, entity_id, title, description, keywords)
  SELECT 'post', p.id, p.title, LEFT(p.content, 200), ARRAY[p.author_id::TEXT]
  FROM posts p
  ON CONFLICT (entity_type, entity_id) DO UPDATE
    SET title = EXCLUDED.title, description = EXCLUDED.description,
        keywords = EXCLUDED.keywords, updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- 
-- HELPER: Update follower counts
-- 
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = followers_count + 1, following_count = following_count + 1
    WHERE id = NEW.follower_id;
    UPDATE profiles SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1), following_count = GREATEST(0, following_count - 1)
    WHERE id = OLD.follower_id;
    UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1)
    WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_follower_counts
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- 
-- HELPER: Update comment counts
-- 
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.entity_id AND NEW.entity_type = 'post';
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_comment_counts
  AFTER INSERT ON comments
  FOR EACH ROW WHEN (NEW.entity_type = 'post')
  EXECUTE FUNCTION update_comment_counts();

-- 
-- HELPER: Update like counts
-- 
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.entity_type = 'project' THEN
      UPDATE projects SET star_count = star_count + 1 WHERE id = NEW.entity_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.entity_type = 'project' THEN
      UPDATE projects SET star_count = GREATEST(0, star_count - 1) WHERE id = OLD.entity_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_like_counts
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_counts();

-- 
-- HELPER: Update project view counts
-- 
CREATE OR REPLACE FUNCTION update_project_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects SET view_count = view_count + 1 WHERE id = NEW.entity_id AND NEW.entity_type = 'project';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_project_views
  AFTER INSERT ON views
  FOR EACH ROW WHEN (NEW.entity_type = 'project')
  EXECUTE FUNCTION update_project_view_count();

-- 
-- HELPER: Update online presence
-- 
CREATE OR REPLACE FUNCTION update_online_presence()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO online_presence (user_id, status, last_seen_at)
  VALUES (NEW.user_id, 'online', now())
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'online',
    last_seen_at = now(),
    updated_at = now();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_online_presence
  AFTER INSERT ON activity_log
  FOR EACH ROW WHEN (NEW.action IN ('LOGIN','POST_CREATED','PROJECT_CREATED'))
  EXECUTE FUNCTION update_online_presence();

-- 
-- HELPER: Cleanup expired passkey challenges
-- 
CREATE OR REPLACE FUNCTION cleanup_expired_passkey_challenges()
RETURNS void AS $$
BEGIN
  DELETE FROM passkey_challenges WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- 
-- HELPER: Get user dashboard summary
-- 
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile', jsonb_build_object(
      'name', p.full_name,
      'username', p.username,
      'avatar_url', p.avatar_url,
      'bio', p.bio,
      'karma_points', p.karma_points,
      'followers_count', p.followers_count,
      'following_count', p.following_count,
      'xp', p.xp,
      'level', p.level,
      'streak_days', p.streak_days
    ),
    'stats', jsonb_build_object(
      'projects_count', p.projects_count,
      'posts_count', p.posts_count,
      'views_count', p.views_count
    ),
    'achievements', (
      SELECT COUNT(*) FROM achievements a WHERE a.user_id = p_user_id
    ),
    'recent_activity', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'title', al.title,
        'action', al.action,
        'created_at', al.created_at
      )) FILTER (WHERE al.title IS NOT NULL), '[]'::jsonb)
      FROM activity_log al
      WHERE al.user_id = p_user_id
      ORDER BY al.created_at DESC
      LIMIT 10
    ),
    'unread_notifications', (
      SELECT COUNT(*) FROM notifications n
      WHERE n.user_id = p_user_id AND n.is_read = FALSE
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 
-- HELPER: Mark notifications as read
-- 
CREATE OR REPLACE FUNCTION mark_notifications_read(p_user_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE notifications SET is_read = TRUE, read_at = now()
  WHERE user_id = p_user_id AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 
-- HELPER: Record activity
-- 
CREATE OR REPLACE FUNCTION record_activity(
  p_user_id TEXT,
  p_action TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_log (user_id, actor_id, action, title, description, metadata)
  VALUES (p_user_id, p_user_id, p_action, p_title, p_description, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;