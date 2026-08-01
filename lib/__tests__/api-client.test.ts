import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  document.cookie = '';
});

describe('api-client', () => {
  it('includes CSRF token for state-changing methods', async () => {
    document.cookie = '__csrf=test-token-123';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'ok' }),
    });

    const { api } = await import('../api-client');
    await api.post('/test', { foo: 'bar' });

    const call = mockFetch.mock.calls[0];
    expect(call[0]).toContain('/test');
    expect(call[1].headers['X-CSRF-Token']).toBe('test-token-123');
    expect(call[1].credentials).toBe('include');
  });

  it('does not include CSRF for GET requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'ok' }),
    });

    const { api } = await import('../api-client');
    await api.get('/test');

    const call = mockFetch.mock.calls[0];
    expect(call[1].headers?.['X-CSRF-Token']).toBeUndefined();
  });

  it('throws ApiError on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }),
    });

    const { api, ApiError } = await import('../api-client');
    try {
      await api.get('/test');
      expect.unreachable('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as any).status).toBe(401);
      expect((e as any).code).toBe('UNAUTHORIZED');
    }
  });

  it('sends JSON body as string', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const { api } = await import('../api-client');
    await api.patch('/test', { name: 'test' });

    const call = mockFetch.mock.calls[0];
    expect(call[1].body).toBe(JSON.stringify({ name: 'test' }));
    expect(call[1].headers['Content-Type']).toBe('application/json');
  });

  it('handles 204 No Content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { api } = await import('../api-client');
    const result = await api.delete('/test');
    expect(result).toBeUndefined();
  });
});
