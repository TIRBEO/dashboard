import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

let auth: typeof import('../auth');

beforeEach(async () => {
  mockFetch.mockReset();
  document.cookie = '';
  vi.resetModules();
  auth = await import('../auth');
});

describe('auth', () => {
  it('getCurrentUser returns user data on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: '1', name: 'Test User', email: 'test@tirbeo.app' }),
    });

    const user = await auth.getCurrentUser();
    expect(user).not.toBeNull();
    expect(user!.id).toBe('1');
    expect(user!.name).toBe('Test User');
    expect(user!.email).toBe('test@tirbeo.app');
  });

  it('getCurrentUser returns null on 401', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    });

    const user = await auth.getCurrentUser();
    expect(user).toBeNull();
  });

  it('getCurrentUser caches result in memory', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: '1', name: 'Cached', email: 'cached@tirbeo.app' }),
    });

    const user1 = await auth.getCurrentUser();
    expect(user1?.name).toBe('Cached');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const user2 = await auth.getCurrentUser();
    expect(user2?.name).toBe('Cached');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    auth.clearUser();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: '1', name: 'Fresh', email: 'fresh@tirbeo.app' }),
    });

    const user3 = await auth.getCurrentUser();
    expect(user3?.name).toBe('Fresh');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('getLoginUrl builds correct URL', () => {
    const url = auth.getLoginUrl();
    expect(url).toContain('accounts.tirbeo.app/login');
    expect(url).toContain(encodeURIComponent(window.location.href));
  });

  it('logout calls API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const assign = vi.fn();
    const originalLocation = window.location.href;
    Object.defineProperty(window, 'location', {
      value: { ...window.location, href: originalLocation, assign },
      writable: true,
    });

    await auth.logout();

    expect(mockFetch.mock.calls[0][0]).toContain('/api/auth/logout');
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
  });
});
