import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, type ApiError } from './api';

const originalFetch = globalThis.fetch;

const mockFetchResponse = (status: number, body: unknown = {}): Response => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
};

describe('ApiClient — unauthorized handler', () => {
  let unauthorizedHandler: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    unauthorizedHandler = vi.fn<() => void>();
    apiClient.setUnauthorizedHandler(unauthorizedHandler);
    // Reset internal isHandlingUnauthorized flag by calling it once and re-registering
    // since the singleton persists across tests.
    // We achieve this by registering a fresh handler each test.
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('triggers handler on 401 for protected endpoints', () => {
    it('should call handler when GET on protected endpoint returns 401', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockFetchResponse(401, { message: 'Token expired' }));

      await expect(apiClient.getAuthenticated('/characters', 'expired-token')).rejects.toMatchObject({
        status: 401,
      });

      expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
    });

    it('should call handler when POST on protected endpoint returns 401', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockFetchResponse(401, { message: 'Token expired' }));

      await expect(
        apiClient.postAuthenticated('/characters', { name: 'Test' }, 'expired-token')
      ).rejects.toMatchObject({ status: 401 });

      expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
    });

    it('should call handler when DELETE on protected endpoint returns 401', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockFetchResponse(401));

      await expect(apiClient.deleteAuthenticated('/characters/1', 'expired-token')).rejects.toMatchObject({
        status: 401,
      });

      expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('does NOT trigger handler on 401 for public auth endpoints', () => {
    it('should NOT call handler when /auth/login returns 401', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(
        mockFetchResponse(401, { message: 'Identifiants incorrects' })
      );

      await expect(
        apiClient.post('/auth/login', { email: 'a@a.com', password: 'wrong' })
      ).rejects.toMatchObject({ status: 401 });

      expect(unauthorizedHandler).not.toHaveBeenCalled();
    });

    it('should NOT call handler when /auth/register returns 401', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(
        mockFetchResponse(401, { message: 'Unauthorized' })
      );

      await expect(
        apiClient.post('/auth/register', { email: 'a@a.com', password: 'pwd' })
      ).rejects.toMatchObject({ status: 401 });

      expect(unauthorizedHandler).not.toHaveBeenCalled();
    });
  });

  describe('does NOT trigger handler on non-401 errors', () => {
    it('should NOT call handler on 400 Bad Request', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockFetchResponse(400, { message: 'Validation error' }));

      await expect(apiClient.getAuthenticated('/characters', 'token')).rejects.toMatchObject({
        status: 400,
      });

      expect(unauthorizedHandler).not.toHaveBeenCalled();
    });

    it('should NOT call handler on 403 Forbidden', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockFetchResponse(403, { message: 'Forbidden' }));

      await expect(apiClient.getAuthenticated('/admin/logs', 'token')).rejects.toMatchObject({
        status: 403,
      });

      expect(unauthorizedHandler).not.toHaveBeenCalled();
    });

    it('should NOT call handler on 500 Server Error', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockFetchResponse(500, { message: 'Internal error' }));

      await expect(apiClient.getAuthenticated('/characters', 'token')).rejects.toMatchObject({
        status: 500,
      });

      expect(unauthorizedHandler).not.toHaveBeenCalled();
    });
  });

  describe('error throwing behaviour', () => {
    it('should still throw the ApiError after triggering handler', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockFetchResponse(401, { message: 'Custom expired msg' }));

      try {
        await apiClient.getAuthenticated('/characters', 'token');
        expect.fail('Expected request to throw');
      } catch (err) {
        const apiError = err as ApiError;
        expect(apiError.status).toBe(401);
        expect(apiError.message).toBe('Custom expired msg');
      }
    });

    it('should use generic message when API returns no message', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockFetchResponse(401));

      await expect(apiClient.getAuthenticated('/characters', 'token')).rejects.toMatchObject({
        status: 401,
        message: 'Une erreur est survenue',
      });
    });
  });

  describe('network errors', () => {
    it('should throw network error without calling handler when fetch fails', async () => {
      globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('Network down'));

      await expect(apiClient.getAuthenticated('/characters', 'token')).rejects.toMatchObject({
        status: 0,
      });

      expect(unauthorizedHandler).not.toHaveBeenCalled();
    });
  });

  describe('reentrance protection', () => {
    it('should call handler only once when multiple parallel 401 responses occur', async () => {
      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce(mockFetchResponse(401))
        .mockResolvedValueOnce(mockFetchResponse(401))
        .mockResolvedValueOnce(mockFetchResponse(401));

      await Promise.allSettled([
        apiClient.getAuthenticated('/a', 'token'),
        apiClient.getAuthenticated('/b', 'token'),
        apiClient.getAuthenticated('/c', 'token'),
      ]);

      expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
    });

    it('should reset reentrance flag when a new handler is registered', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockFetchResponse(401));
      await expect(apiClient.getAuthenticated('/a', 'token')).rejects.toMatchObject({ status: 401 });
      expect(unauthorizedHandler).toHaveBeenCalledTimes(1);

      const secondHandler = vi.fn<() => void>();
      apiClient.setUnauthorizedHandler(secondHandler);

      globalThis.fetch = vi.fn().mockResolvedValueOnce(mockFetchResponse(401));
      await expect(apiClient.getAuthenticated('/b', 'token')).rejects.toMatchObject({ status: 401 });

      expect(secondHandler).toHaveBeenCalledTimes(1);
    });
  });
});
