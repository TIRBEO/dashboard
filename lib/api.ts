import { LOCALES } from "@/lib/locales";

export const API = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000'
      : '')
  : process.env.NEXT_PUBLIC_API_URL || 'https://api.tirbeo.app';

function getCsrf(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
  return match?.[1] || '';
}

function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try { return window.localStorage.getItem('auth_token') || undefined; } catch { return undefined; }
}

export class ApiError extends Error {
  constructor(public status: number, code: string, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrf = getCsrf();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }
  const bearer = getToken();
  if (bearer) headers['Authorization'] = `Bearer ${bearer}`;
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API}${path}`, { ...options, headers, credentials: 'include' });
  if (!res.ok) {
    let body: any;
    try { body = await res.json(); } catch { body = {}; }
    const errorCode = typeof body?.error === 'string' ? body.error : (body?.error?.code || body?.code || 'UNKNOWN');
    const errorMessage = typeof body?.error === 'string' ? body.error : (body?.error?.message || body?.message || body?.error || res.statusText);
    throw new ApiError(res.status, errorCode, errorMessage, body);
  }
  if (res.status === 204) return undefined as T;
  const raw = await res.text();
  if (!raw) return undefined as T;
  try { return JSON.parse(raw) as T; } catch { return raw as unknown as T; }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  request: <T>(path: string, options?: RequestInit) => request<T>(path, options),
};

export function isUnauthorizedError(e: unknown): boolean {
  return e instanceof ApiError && e.status === 401;
}

export function getBlockStatus(e: unknown): { banned?: boolean; suspended?: boolean; reason?: string; until?: string | null } | null {
  if (!(e instanceof ApiError) || e.status !== 403) return null;
  const d = e.data as any;
  if (d?.banned) return { banned: true, reason: d.reason };
  if (d?.suspended) return { suspended: true, reason: d.reason, until: d.until };
  return null;
}

export async function cancelAccountDeletion() {
  await api.request('/api/user/delete-account?cancel=1', { method: 'DELETE' });
}

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
  mustChangePassword?: boolean;
  scheduledDeletionAt?: string | null;
  deletionReason?: string | null;
  loginCount?: number | null;
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt?: string | null;
  [key: string]: any;
}

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

export interface Ticket {
  id: string;
  subject: string;
  title?: string;
  description?: string;
  status: string;
  priority?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  customerId?: string;
  assignedId?: string | null;
  closedAt?: string | null;
  messages?: any[];
  attachments?: any[];
}

export async function getCurrentUser(): Promise<Profile> {
  return api.get<Profile>('/api/users/me');
}

export async function listNotifications(limit = 20, offset = 0) {
  return api.get<{ notifications: NotificationItem[]; unread: number; total: number }>(
    `/api/notifications?limit=${limit}&offset=${offset}`
  );
}

export async function markAllNotificationsRead() {
  return api.patch('/api/notifications', { markAll: true });
}

export async function markNotificationsRead(ids: string[]) {
  return api.patch('/api/notifications', { notificationIds: ids });
}

export async function deleteNotification(id: string) {
  return api.delete(`/api/notifications?id=${id}`);
}

export async function deleteNotifications(ids?: string[]) {
  if (ids && ids.length > 0) {
    return api.request('/api/notifications', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notificationIds: ids }) });
  }
  return api.delete('/api/notifications');
}

export async function listTickets(params: { limit?: number; status?: string; page?: number; q?: string; priority?: string; category?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.q) qs.set('q', params.q);
  if (params.priority) qs.set('priority', params.priority);
  if (params.category) qs.set('category', params.category);
  return api.get<{ data: Ticket[]; total: number; page?: number; limit?: number }>(`/api/support/tickets?${qs}`);
}

export async function getPreferences() {
  return api.get<Record<string, any>>('/api/preferences');
}

export async function updatePreferences(data: Record<string, any>) {
  return api.patch('/api/preferences', data);
}

export async function getUserActivity(limit = 20, offset = 0) {
  return api.get<{
    events: Array<{ id: string; action: string; targetType?: string | null; targetId?: string | null; metadata: any; severity?: string; createdAt: string }>;
    total: number;
  }>(`/api/user/activity?limit=${limit}&offset=${offset}`);
}

export async function createTicket(data: { title: string; message: string; category?: string; priority?: string }) {
  return api.post<{ id: string }>('/api/support/tickets', data);
}

export async function getTicket(id: string) {
  return api.get<{ id: string; subject: string; status: string; priority: string; messages: any[]; createdAt: string; updatedAt: string }>(`/api/support/tickets/${id}`);
}

export async function replyToTicket(id: string, message: string) {
  return api.post(`/api/support/tickets/${id}/messages`, { message });
}

export async function uploadTicketAttachment(ticketId: string, file: File): Promise<{ url: string; id: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ticketId', ticketId);
  const bearer = getToken();
  const csrf = getCsrf();
  const headers: Record<string, string> = {};
  if (bearer) headers['Authorization'] = `Bearer ${bearer}`;
  if (csrf) headers['X-CSRF-Token'] = csrf;
  const res = await fetch(`${API}/api/support/tickets/${ticketId}/attachments`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) throw new ApiError(res.status, 'UPLOAD_FAILED', 'Attachment upload failed');
  return res.json();
}

export async function deleteAccount(password?: string, reason?: string): Promise<{ ok?: boolean; scheduledAt?: string; message?: string }> {
  return api.post('/api/user/delete-account', { password, reason }) as any;
}

export async function requestDeleteOtp(): Promise<{ ok?: boolean; message?: string }> {
  return api.post('/api/user/delete-account', { step: 'request' }) as any;
}

export async function verifyDeleteOtp(code: string, reason?: string): Promise<{ ok?: boolean; scheduledAt?: string; message?: string }> {
  return api.post('/api/user/delete-account', { step: 'verify', code, reason }) as any;
}

export async function cancelDeletion(): Promise<{ ok?: boolean; message?: string }> {
  return api.delete('/api/user/delete-account?cancel=1') as any;
}

export async function logout() {
  try { await api.post('/api/auth/logout'); } catch { /* ok */ }
  try { window.localStorage.removeItem('auth_token'); } catch { /* ok */ }
}

function toLocale(lang?: string | null): string {
  if (lang && lang in LOCALES) return LOCALES[lang];
  if (lang) return lang;
  return LOCALES.en;
}

export function formatDate(iso: string, lang?: string | null): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(toLocale(lang), { month: "short", day: "numeric" }).format(d);
}

export function formatDayMonth(iso: string, lang?: string | null): string {
  return formatDate(iso, lang);
}
