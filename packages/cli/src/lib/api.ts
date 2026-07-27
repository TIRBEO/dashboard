import { getAuthToken } from './config';

const API_BASE = 'https://api.tirbeo.app';

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

export async function apiGet<T = any>(path: string): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  try {
    const res = await fetch(API_BASE + path, {
      method: 'GET',
      headers: {
        ...(token ? { 'Cookie': '__session=' + token } : {}),
        'Content-Type': 'application/json',
      },
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, data: null, error: text || res.statusText };
    try { return { ok: true, status: res.status, data: JSON.parse(text) }; }
    catch { return { ok: true, status: res.status, data: text as any }; }
  } catch (err: any) {
    return { ok: false, status: 0, data: null, error: err.message || 'Network error' };
  }
}

export async function apiPost<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const csrf = getCsrfToken();
  try {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Cookie': '__session=' + token } : {}),
        ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
      },
      ...(body != null ? { body: JSON.stringify(body) } : {}),
      credentials: 'include',
    } as RequestInit);
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, data: null, error: text || res.statusText };
    try { return { ok: true, status: res.status, data: JSON.parse(text) }; }
    catch { return { ok: true, status: res.status, data: text as any }; }
  } catch (err: any) {
    return { ok: false, status: 0, data: null, error: err.message || 'Network error' };
  }
}

export async function apiPatch<T = any>(path: string, body: any): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const csrf = getCsrfToken();
  try {
    const res = await fetch(API_BASE + path, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Cookie': '__session=' + token } : {}),
        ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, data: null, error: text || res.statusText };
    try { return { ok: true, status: res.status, data: JSON.parse(text) }; }
    catch { return { ok: true, status: res.status, data: text as any }; }
  } catch (err: any) {
    return { ok: false, status: 0, data: null, error: err.message || 'Network error' };
  }
}

export async function apiDelete<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const csrf = getCsrfToken();
  try {
    const res = await fetch(API_BASE + path, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Cookie': '__session=' + token } : {}),
        ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
      },
      ...(body != null ? { body: JSON.stringify(body) } : {}),
      credentials: 'include',
    } as RequestInit);
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, data: null, error: text || res.statusText };
    try { return { ok: true, status: res.status, data: JSON.parse(text) }; }
    catch { return { ok: true, status: res.status, data: text as any }; }
  } catch (err: any) {
    return { ok: false, status: 0, data: null, error: err.message || 'Network error' };
  }
}

function getCsrfToken(): string | undefined {
  return undefined;
}
