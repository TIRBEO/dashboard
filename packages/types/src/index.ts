export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';
  locale: string;
  timezone: string | null;
  theme: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  url: string | null;
  status: string;
  version: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Session {
  id: string;
  userId: string;
  token: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  location: string | null;
  deviceName: string | null;
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  type: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'OTHER';
  platform: string | null;
  browser: string | null;
  lastSeenAt: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string | null;
  organizationId: string | null;
  applicationId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  result: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  organizationId: string | null;
  applicationId: string | null;
  title: string;
  body: string | null;
  link: string | null;
  icon: string | null;
  priority: number;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';
  readAt: string | null;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  prefix: string;
  scopes: string[];
  active: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export interface OAuthAccount {
  id: string;
  userId: string;
  provider: 'GOOGLE' | 'GITHUB' | 'DISCORD' | 'MICROSOFT' | 'APPLE' | 'CUSTOM';
  providerId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  scope: string;
  isSystem: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  scope: string;
  createdAt: string;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  type: string;
  group: string;
  label: string | null;
  description: string | null;
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackgroundJob {
  id: string;
  type: string;
  queue: string;
  payload: Record<string, unknown>;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  attempts: number;
  maxAttempts: number;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  requestId: string;
  details?: Record<string, unknown>;
}

export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';