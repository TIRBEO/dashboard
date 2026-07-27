-- Tirbeo Developer Platform -- Complete SQL Schema A-Z
-- Run in Supabase SQL Editor or via migration pipeline

-- A: Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  badge TEXT,
  xp_reward INTEGER DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT achievements_user_type_unique UNIQUE (user_id, type)
);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(type);
CREATE INDEX IF NOT EXISTS idx_achievements_earned_at ON achievements(earned_at DESC);

-- B: Badges
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#D8B36A',
  xp_required INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO badges (name, description, icon, color, xp_required, is_system) VALUES
  ('First Steps', 'Complete your profile', NULL, '#30d158', 10, TRUE),
  ('Builder', 'Create your first project', NULL, '#d42a5a', 50, TRUE),
  ('Writer', 'Publish your first post', NULL, '#64d2ff', 30, TRUE),
  ('Connector', 'Get your first follower', NULL, '#D8B36A', 25, TRUE),
  ('Streak Master', '7-day posting streak', NULL, '#ff453a', 200, TRUE),
  ('Open Source', 'Publish an open-source project', NULL, '#238636', 100, TRUE),
  ('Mentor', 'Help 10 developers', NULL, '#ffd60a', 500, TRUE),
  ('Veteran', '1 year on Tirbeo', NULL, '#ffd60a', 1000, TRUE)
ON CONFLICT (name) DO NOTHING;

-- C: Comments
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- D: Districts
CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  province INTEGER CHECK (province BETWEEN 1 AND 7)
);

-- F: Follows
CREATE TABLE IF NOT EXISTS follows (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  follower_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT follows_follower_following_unique UNIQUE (follower_id, following_id),
  CONSTRAINT follows_not_self CHECK (follower_id != following_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- G: Goals
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'personal',
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  started_at DATE,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- L: Likes
CREATE TABLE IF NOT EXISTS likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT likes_user_entity_unique UNIQUE (user_id, entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_entity ON likes(entity_type, entity_id);

-- N: Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  actor_id TEXT REFERENCES auth.users(id),
  entity_type TEXT,
  entity_id TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- P: Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  github_url TEXT,
  demo_url TEXT,
  language TEXT,
  category TEXT DEFAULT 'other',
  visibility TEXT DEFAULT 'public',
  is_startup BOOLEAN DEFAULT FALSE,
  pinned BOOLEAN DEFAULT FALSE,
  star_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_stars ON projects(star_count DESC);
CREATE INDEX IF NOT EXISTS idx_projects_views ON projects(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- PP: Project Tags
CREATE TABLE IF NOT EXISTS project_tags (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT project_tags_unique UNIQUE (project_id, name)
);
CREATE INDEX IF NOT EXISTS idx_project_tags_project ON project_tags(project_id);

-- PR: Profile Views
CREATE TABLE IF NOT EXISTS profile_views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  viewer_id TEXT REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON profile_views(created_at DESC);

-- R: Resumes
CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content JSONB DEFAULT '{}',
  is_template BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_slug ON resumes(slug);

-- S: Startups
CREATE TABLE IF NOT EXISTS startups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  stage TEXT DEFAULT 'idea',
  funding TEXT,
  industry TEXT,
  website TEXT,
  logo_url TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_hiring BOOLEAN DEFAULT FALSE,
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id);
CREATE INDEX IF NOT EXISTS idx_startups_stage ON startups(stage);

-- T: Tags
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);

-- U: User Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  github TEXT,
  linkedin TEXT,
  twitter TEXT,
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  role TEXT,
  company TEXT,
  education TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  karma_points INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_streak_at DATE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  privacy_profile_visibility TEXT DEFAULT 'public',
  privacy_activity_status TEXT DEFAULT 'visible',
  privacy_search_visibility BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'system',
  accent_color TEXT DEFAULT 'crimson',
  font_family TEXT DEFAULT 'inter',
  font_size TEXT DEFAULT 'default',
  reduced_motion BOOLEAN DEFAULT FALSE,
  high_contrast BOOLEAN DEFAULT FALSE,
  sidebar_layout TEXT DEFAULT 'expanded',
  feed_layout TEXT DEFAULT 'card',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);

-- U: Users (already exists via Supabase auth)
-- Added columns to users table handled in separate migration

-- W: Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  owner_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free',
  is_archived BOOLEAN DEFAULT FALSE,
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);

-- WT: Workspaces Teams
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT team_members_unique UNIQUE (workspace_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_team_members_workspace ON team_members(workspace_id);

-- Y: XP Ledger
CREATE TABLE IF NOT EXISTS xp_ledger (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  balance_after INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_id ON xp_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_created_at ON xp_ledger(created_at DESC);

-- Z: Z-Index Cache (performance)
CREATE TABLE IF NOT EXISTS zindex_cache (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  cache_key TEXT NOT NULL UNIQUE,
  cache_value JSONB DEFAULT '{}',
  ttl_seconds INTEGER DEFAULT 300,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '5 minutes')
);
CREATE INDEX IF NOT EXISTS idx_zindex_cache_key ON zindex_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_zindex_cache_expires ON zindex_cache(expires_at);

-- Support Tickets (Admin Chat)
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'general',
  assigned_to TEXT REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);

-- Support Ticket Messages
CREATE TABLE IF NOT EXISTS ticket_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES auth.users(id),
  sender_role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at DESC);

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id TEXT REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  device TEXT,
  is_revoked BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  reply_to TEXT REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  type TEXT NOT NULL DEFAULT 'direct',
  name TEXT,
  last_message_at TIMESTAMPTZ,
  created_by TEXT REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Conversation Members
CREATE TABLE IF NOT EXISTS conversation_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT conversation_members_unique UNIQUE (conversation_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members(user_id);

-- Community Members
CREATE TABLE IF NOT EXISTS community_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT community_members_unique UNIQUE (community_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  location TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  url TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  organizer_id TEXT REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);

-- Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT event_registrations_unique UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_event_regs_event ON event_registrations(event_id);

-- Community Projects
CREATE TABLE IF NOT EXISTS community_projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT community_projects_unique UNIQUE (community_id, project_id)
);
CREATE INDEX IF NOT EXISTS idx_community_projects_community ON community_projects(community_id);

-- Project Collaborations (for real-time collab)
CREATE TABLE IF NOT EXISTS project_collaborations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cursor_position JSONB,
  cursor_color TEXT,
  last_activity TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT project_collab_unique UNIQUE (project_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_project_collab_project ON project_collaborations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collab_last_activity ON project_collaborations(last_activity DESC);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT bookmarks_unique UNIQUE (user_id, entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  reporter_id TEXT NOT NULL REFERENCES auth.users(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  moderator_id TEXT REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_entity ON reports(entity_type, entity_id);

-- Data Exports
CREATE TABLE IF NOT EXISTS data_exports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  format TEXT DEFAULT 'json',
  status TEXT DEFAULT 'pending',
  file_url TEXT,
  file_size BIGINT,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_data_exports_user_id ON data_exports(user_id);

-- Learning Paths
CREATE TABLE IF NOT EXISTS learning_paths (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  skills TEXT[] DEFAULT '{}',
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  started_at DATE,
  completed_at DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id);

-- Skill Ratings
CREATE TABLE IF NOT EXISTS skill_ratings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  years_experience REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT skill_ratings_user_skill_unique UNIQUE (user_id, skill_id)
);
CREATE INDEX IF NOT EXISTS idx_skill_ratings_user ON skill_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_ratings_level ON skill_ratings(level DESC);

-- User Skills (junction)
CREATE TABLE IF NOT EXISTS user_skills (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT,
  proficiency TEXT DEFAULT 'intermediate',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);

-- User Links
CREATE TABLE IF NOT EXISTS user_links (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_links_user_platform_unique UNIQUE (user_id, platform)
);
CREATE INDEX IF NOT EXISTS idx_user_links_user_id ON user_links(user_id);

-- Timeline Entries
CREATE TABLE IF NOT EXISTS timeline_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#D8B36A',
  date DATE,
  url TEXT,
  type TEXT DEFAULT 'milestone',
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_timeline_user_id ON timeline_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_sort ON timeline_entries(sort_order);

-- Tasks / To-Do
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  category TEXT DEFAULT 'personal',
  tags TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Experience (Resume)
CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_experiences_user_id ON experiences(user_id);

-- Education (Resume)
CREATE TABLE IF NOT EXISTS education (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  gpa TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date_issued DATE,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);

-- Languages
CREATE TABLE IF NOT EXISTS user_languages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  proficiency TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id);

-- External Accounts
CREATE TABLE IF NOT EXISTS external_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT,
  url TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT external_accounts_user_platform_unique UNIQUE (user_id, platform)
);
CREATE INDEX IF NOT EXISTS idx_external_accounts_user ON external_accounts(user_id);

-- Post Tags
CREATE TABLE IF NOT EXISTS post_tags (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_post_tags_slug ON post_tags(slug);

-- Post Hashtags
CREATE TABLE IF NOT EXISTS post_hashtags (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES post_tags(id) ON DELETE CASCADE,
  CONSTRAINT post_hashtags_unique UNIQUE (post_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post ON post_hashtags(post_id);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visibility TEXT DEFAULT 'public',
  type TEXT DEFAULT 'post',
  star_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  slug TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);

-- Views (Content Viewing Analytics)
CREATE TABLE IF NOT EXISTS views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_views_entity ON views(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_views_user ON views(user_id);

-- Votes (Polls)
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  option TEXT,
  value INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT votes_user_entity_unique UNIQUE (user_id, entity_type, entity_id, option)
);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- Invite Acceptances
CREATE TABLE IF NOT EXISTS invitation_acceptances (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT invitation_acceptances_unique UNIQUE (invitation_id, user_id)
);

-- Invitations
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  inviter_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_name TEXT,
  community_id TEXT REFERENCES communities(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days')
);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(invitee_email);

-- Search Index
CREATE TABLE IF NOT EXISTS search_index (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  keywords TEXT[] DEFAULT '{}',
  category TEXT,
  slug TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_search_index_entity ON search_index(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_search_index_keywords ON search_index USING gin(unnest(keywords));

-- User Roles (RBAC)
CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  assigned_by TEXT REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#D8B36A',
  icon TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Community Projects (many-to-many)
-- (Already defined above as community_projects)

-- Yearly Milestones
CREATE TABLE IF NOT EXISTS yearly_milestones (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_xp INTEGER DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  streak_max INTEGER DEFAULT 0,
  achievements_count INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'bronze',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT yearly_milestones_user_year_unique UNIQUE (user_id, year)
);
CREATE INDEX IF NOT EXISTS idx_yearly_milestones_user ON yearly_milestones(user_id);

-- Usage Metrics
CREATE TABLE IF NOT EXISTS usage_metrics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT usage_metrics_user_feature_period_unique UNIQUE (user_id, feature, period_start, period_end)
);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user ON usage_metrics(user_id);

-- Achievement Types ENUM values (referenced by achievements table)
-- Valid achievement types: first_project, first_post, first_follower, streak_7, streak_30, contributor, maintainer, mentor, beta_user, early_adopter, custom

-- Helper Functions
-- Refresh search index
CREATE OR REPLACE FUNCTION refresh_search_index()
RETURNS void AS $$
BEGIN
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Update follower counts trigger
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  NULL;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Record activity helper
CREATE OR REPLACE FUNCTION record_activity(
  p_user_id TEXT,
  p_action TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_log (user_id, actor_id, action, title, description)
  VALUES (p_user_id, p_user_id, p_action, p_title, p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get dashboard summary helper
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile', jsonb_build_object(
      'name', p.full_name,
      'username', p.username,
      'avatar_url', p.avatar_url
    ),
    'stats', jsonb_build_object(
      'projects_count', p.projects_count,
      'posts_count', p.posts_count
    ),
    'unread_notifications', (
      SELECT COUNT(*) FROM notifications n
      WHERE n.user_id = p_user_id AND n.is_read = FALSE
    )
  ) INTO result
  FROM profiles p
  WHERE p.id = p_user_id;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;