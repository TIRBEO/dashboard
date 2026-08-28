/**
 * Shared types for the Tirbeo dashboard.
 *
 * These types mirror the API response shapes.
 * Import from here instead of directly from api.ts to avoid circular deps.
 */

/* ── User / Profile ────────────────────────────────────────── */

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  photoUrl?: string | null;
  adminRole?: string | null;
  username?: string | null;
  bio?: string | null;
  occupation?: string | null;
  companyName?: string | null;
  companyRole?: string | null;
  industry?: string | null;
  companySize?: string | null;
  website?: string | null;
  linkedin?: string | null;
  githubUsername?: string | null;
  twitter?: string | null;
  country?: string | null;
  timezone?: string | null;
  language?: string | null;
  dateFormat?: string | null;
  timeFormat?: string | null;
  gender?: string | null;
  birthday?: string | null;
  secondaryEmail?: string | null;
  secondaryEmailVerified?: boolean | null;
  recoveryEmail?: string | null;
  recoveryEmailVerified?: boolean | null;
  preferences?: Record<string, any> | null;
  totpEnabled?: boolean;
  hasPassword?: boolean;
  mustChangePassword?: boolean;
  scheduledDeletionAt?: string | null;
  deletionReason?: string | null;
  loginCount?: number | null;
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt?: string | null;
  hasGoogle?: boolean;
  hasGithub?: boolean;
  hasDiscord?: boolean;
  isVerified?: boolean;
  [key: string]: any;
}

/* ── Notifications ─────────────────────────────────────────── */

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  link?: string;
  type?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  unread: number;
  total: number;
}

/* ── Support Tickets ───────────────────────────────────────── */

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  isInternal: boolean;
  readAt: string | null;
  readBy: string | null;
  createdAt: string;
  author?: {
    id: string;
    name: string | null;
    photoUrl: string | null;
    email: string;
  } | null;
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  messageId: string | null;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description?: string | null;
  status: string;
  priority: string;
  category: string;
  source: string;
  application?: string | null;
  assignedId?: string | null;
  closedAt?: string | null;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
  attachments?: TicketAttachment[];
  customer?: {
    id: string;
    name: string | null;
    photoUrl: string | null;
    email: string;
  } | null;
  assigned?: {
    id: string;
    name: string | null;
    photoUrl: string | null;
  } | null;
  _count?: { messages: number };
}

export interface TicketListResponse {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/* ── Sessions ──────────────────────────────────────────────── */

export interface Session {
  id: string;
  device: string;
  userAgent: string;
  ipAddress: string;
  ip: string;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
  lastSeenAt: string;
  isCurrent: boolean;
}

/* ── Activity ──────────────────────────────────────────────── */

export interface ActivityItem {
  id: string;
  source?: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: any;
  severity?: string;
  createdAt: string;
}

/* ── Block Status ──────────────────────────────────────────── */

export interface BlockStatus {
  banned?: boolean;
  suspended?: boolean;
  scheduled?: boolean;
  deleted?: boolean;
  reason?: string;
  deletionReason?: string;
  until?: string | null;
  scheduledAt?: string;
  deletedAt?: string | null;
}

/* ── Preferences ───────────────────────────────────────────── */

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  forms: boolean;
  product: boolean;
  support: boolean;
  formsEmail: boolean;
  formsPush: boolean;
  productEmail: boolean;
  productPush: boolean;
  supportEmail: boolean;
  supportPush: boolean;
  digestEnabled: boolean;
  digestFrequency: "daily" | "weekly" | "monthly";
}

export interface PrivacyPreferences {
  allowAnalytics: boolean;
  allowCrashReports: boolean;
}

/* ── Integrations ──────────────────────────────────────────── */

export interface Integration {
  provider: string;
  connected: boolean;
  updatedAt?: string;
  metadata?: {
    email?: string;
    [key: string]: any;
  };
}

/* ── Navigation ────────────────────────────────────────────── */

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  external?: boolean;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}
