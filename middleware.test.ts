import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { middleware } from './middleware';
import type { NextRequest } from 'next/server';

// Mock the rate limit module
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({
    allowed: true,
    limit: 60,
    remaining: 59,
    reset: Math.floor(Date.now() / 1000) + 60,
  })),
  createRateLimitHeaders: vi.fn(() => ({
    'X-RateLimit-Limit': '60',
    'X-RateLimit-Remaining': '59',
    'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60),
  })),
  rateLimitConfigs: {
    '/api/symbols': { limit: 60, window: 60 },
    '/api/quote': { limit: 30, window: 60 },
    '/api/health': { limit: 10, window: 60 },
  },
}));

// Mock validation module
vi.mock('@/lib/validation', () => ({
  createErrorResponse: vi.fn((code: string, message: string, details: unknown) => ({
    error: { code, message, details },
  })),
  ErrorCode: {
    RATE_LIMITED: 'RATE_LIMITED',
  },
}));

// Helper to create mock NextRequest
function createMockRequest(pathname: string, headers: Record<string, string> = {}): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  return {
    nextUrl: url,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null,
    },
  } as unknown as NextRequest;
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('X-Request-Id header', () => {
    it('adds X-Request-Id header to /api/symbols response', () => {
      const request = createMockRequest('/api/symbols');
      const response = middleware(request);

      const requestId = response.headers.get('X-Request-Id');
      expect(requestId).toBeDefined();
      expect(requestId).not.toBe('');
    });

    it('adds X-Request-Id header to /api/quote response', () => {
      const request = createMockRequest('/api/quote');
      const response = middleware(request);

      const requestId = response.headers.get('X-Request-Id');
      expect(requestId).toBeDefined();
      expect(requestId).not.toBe('');
    });

    it('adds X-Request-Id header to /api/health response', () => {
      const request = createMockRequest('/api/health');
      const response = middleware(request);

      const requestId = response.headers.get('X-Request-Id');
      expect(requestId).toBeDefined();
      expect(requestId).not.toBe('');
    });

    it('generates valid UUID format for X-Request-Id', () => {
      const request = createMockRequest('/api/quote');
      const response = middleware(request);

      const requestId = response.headers.get('X-Request-Id');
      expect(requestId).toBeDefined();

      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(requestId).toMatch(uuidRegex);
    });

    it('generates unique X-Request-Id for each request', () => {
      const request1 = createMockRequest('/api/quote');
      const request2 = createMockRequest('/api/quote');

      const response1 = middleware(request1);
      const response2 = middleware(request2);

      const requestId1 = response1.headers.get('X-Request-Id');
      const requestId2 = response2.headers.get('X-Request-Id');

      expect(requestId1).toBeDefined();
      expect(requestId2).toBeDefined();
      expect(requestId1).not.toBe(requestId2);
    });

    it('does not add X-Request-Id to non-API routes', () => {
      const request = createMockRequest('/about');
      const response = middleware(request);

      // Non-API routes return NextResponse.next() without modifications
      // The response won't have X-Request-Id header
      const requestId = response.headers.get('X-Request-Id');
      expect(requestId).toBeNull();
    });

    it('adds X-Request-Id to API routes not in rate limit config', () => {
      const request = createMockRequest('/api/unknown');
      const response = middleware(request);

      const requestId = response.headers.get('X-Request-Id');
      expect(requestId).toBeDefined();
      expect(requestId).not.toBe('');
    });
  });

  describe('X-Request-Id on error responses', () => {
    it('includes X-Request-Id in rate limited (429) response', async () => {
      // Override the rate limit check to return not allowed
      const { checkRateLimit } = await import('@/lib/rate-limit');
      vi.mocked(checkRateLimit).mockReturnValueOnce({
        allowed: false,
        limit: 30,
        remaining: 0,
        reset: Math.floor(Date.now() / 1000) + 60,
      });

      const request = createMockRequest('/api/quote');
      const response = middleware(request);

      expect(response.status).toBe(429);

      const requestId = response.headers.get('X-Request-Id');
      expect(requestId).toBeDefined();
      expect(requestId).not.toBe('');
    });

    it('includes valid UUID in rate limited response', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      vi.mocked(checkRateLimit).mockReturnValueOnce({
        allowed: false,
        limit: 30,
        remaining: 0,
        reset: Math.floor(Date.now() / 1000) + 60,
      });

      const request = createMockRequest('/api/quote');
      const response = middleware(request);

      const requestId = response.headers.get('X-Request-Id');
      expect(requestId).toBeDefined();

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(requestId).toMatch(uuidRegex);
    });
  });

  describe('rate limit headers', () => {
    it('includes rate limit headers alongside X-Request-Id', () => {
      const request = createMockRequest('/api/symbols');
      const response = middleware(request);

      // Check both rate limit and request ID headers are present
      expect(response.headers.get('X-RateLimit-Limit')).toBe('60');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('59');
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
      expect(response.headers.get('X-Request-Id')).toBeDefined();
    });
  });
});
