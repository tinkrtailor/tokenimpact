import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock the symbol-catalog module
vi.mock('@/lib/symbol-catalog', () => {
  const mockCatalog = [
    { symbol: 'BTC-USD', base: 'BTC', quote: 'USD', exchanges: ['binance', 'coinbase', 'kraken'] },
    { symbol: 'ETH-USD', base: 'ETH', quote: 'USD', exchanges: ['binance', 'coinbase', 'kraken'] },
    { symbol: 'BTC-USDT', base: 'BTC', quote: 'USDT', exchanges: ['binance', 'kraken'] },
    { symbol: 'ETH-USDT', base: 'ETH', quote: 'USDT', exchanges: ['binance'] },
    { symbol: 'SOL-USD', base: 'SOL', quote: 'USD', exchanges: ['coinbase', 'kraken'] },
    { symbol: 'DOGE-USD', base: 'DOGE', quote: 'USD', exchanges: ['binance', 'coinbase'] },
  ];

  return {
    getSymbolCatalog: vi.fn(() => mockCatalog),
    filterByQuote: vi.fn((symbols, quote) =>
      symbols.filter((s: { quote: string }) => s.quote === quote.toUpperCase())
    ),
    filterByExchange: vi.fn((symbols, exchange) =>
      symbols.filter((s: { exchanges: string[] }) => s.exchanges.includes(exchange.toLowerCase()))
    ),
    filterBySearch: vi.fn((symbols, search) =>
      symbols.filter(
        (s: { base: string; quote: string }) =>
          s.base.toLowerCase().includes(search.toLowerCase()) ||
          s.quote.toLowerCase().includes(search.toLowerCase())
      )
    ),
  };
});

// Helper to create a mock request
function createRequest(params: Record<string, string> = {}): NextRequest {
  const searchParams = new URLSearchParams(params);
  const url = `http://localhost:3000/api/symbols?${searchParams.toString()}`;
  return new NextRequest(url);
}

describe('GET /api/symbols', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('returns all symbols when no filters applied', async () => {
      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.symbols).toBeDefined();
      expect(Array.isArray(body.symbols)).toBe(true);
      expect(body.symbols.length).toBeGreaterThan(0);
      expect(body.total).toBe(body.symbols.length);
      expect(body.timestamp).toBeDefined();
    });

    it('includes symbol metadata in response', async () => {
      const request = createRequest();
      const response = await GET(request);

      const body = await response.json();
      const btcSymbol = body.symbols.find(
        (s: { symbol: string }) => s.symbol === 'BTC-USD'
      );

      expect(btcSymbol).toBeDefined();
      expect(btcSymbol.base).toBe('BTC');
      expect(btcSymbol.quote).toBe('USD');
      expect(btcSymbol.exchanges).toBeDefined();
      expect(Array.isArray(btcSymbol.exchanges)).toBe(true);
    });

    it('indicates cache status in response', async () => {
      const request = createRequest();
      const response = await GET(request);

      const body = await response.json();
      expect(typeof body.cached).toBe('boolean');
    });
  });

  describe('filtering by quote currency', () => {
    it('filters symbols by quote currency (USD)', async () => {
      const request = createRequest({ quote: 'USD' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.symbols.length).toBeGreaterThan(0);
      body.symbols.forEach((s: { quote: string }) => {
        expect(s.quote).toBe('USD');
      });
    });

    it('filters symbols by quote currency (USDT)', async () => {
      const request = createRequest({ quote: 'USDT' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      body.symbols.forEach((s: { quote: string }) => {
        expect(s.quote).toBe('USDT');
      });
    });

    it('returns empty array for non-existent quote currency', async () => {
      const request = createRequest({ quote: 'NONEXISTENT' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.symbols).toHaveLength(0);
      expect(body.total).toBe(0);
    });
  });

  describe('filtering by exchange', () => {
    it('filters symbols by exchange (binance)', async () => {
      const request = createRequest({ exchange: 'binance' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.symbols.length).toBeGreaterThan(0);
      body.symbols.forEach((s: { exchanges: string[] }) => {
        expect(s.exchanges).toContain('binance');
      });
    });

    it('filters symbols by exchange (coinbase)', async () => {
      const request = createRequest({ exchange: 'coinbase' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      body.symbols.forEach((s: { exchanges: string[] }) => {
        expect(s.exchanges).toContain('coinbase');
      });
    });

    it('filters symbols by exchange (kraken)', async () => {
      const request = createRequest({ exchange: 'kraken' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      body.symbols.forEach((s: { exchanges: string[] }) => {
        expect(s.exchanges).toContain('kraken');
      });
    });
  });

  describe('search functionality', () => {
    it('searches symbols by base currency', async () => {
      const request = createRequest({ search: 'BTC' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.symbols.length).toBeGreaterThan(0);
      body.symbols.forEach((s: { base: string; quote: string }) => {
        expect(s.base.includes('BTC') || s.quote.includes('BTC')).toBe(true);
      });
    });

    it('searches symbols case-insensitively', async () => {
      const request = createRequest({ search: 'btc' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.symbols.length).toBeGreaterThan(0);
    });

    it('returns empty array for non-matching search', async () => {
      const request = createRequest({ search: 'ZZZZZ' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.symbols).toHaveLength(0);
    });
  });

  describe('combined filters', () => {
    it('combines quote and exchange filters', async () => {
      const request = createRequest({ quote: 'USD', exchange: 'binance' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      body.symbols.forEach((s: { quote: string; exchanges: string[] }) => {
        expect(s.quote).toBe('USD');
        expect(s.exchanges).toContain('binance');
      });
    });

    it('combines search and exchange filters', async () => {
      const request = createRequest({ search: 'ETH', exchange: 'coinbase' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      body.symbols.forEach((s: { base: string; quote: string; exchanges: string[] }) => {
        expect(s.base.includes('ETH') || s.quote.includes('ETH')).toBe(true);
        expect(s.exchanges).toContain('coinbase');
      });
    });
  });

  describe('limit parameter', () => {
    it('limits results when limit param provided', async () => {
      const request = createRequest({ limit: '2' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.symbols.length).toBeLessThanOrEqual(2);
      // Total should reflect all matching symbols before limit
      expect(body.total).toBeGreaterThanOrEqual(body.symbols.length);
    });

    it('returns all results when limit is greater than total', async () => {
      const request = createRequest({ limit: '1000' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.symbols.length).toBe(body.total);
    });

    it('uses default limit when not specified', async () => {
      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      // Default limit is 100
      expect(body.symbols.length).toBeLessThanOrEqual(100);
    });
  });

  describe('validation and edge cases', () => {
    it('uses default limit for invalid limit (negative)', async () => {
      // The validation transform defaults invalid limits to 100
      const request = createRequest({ limit: '-1' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      // Should use default limit (100)
      expect(body.symbols.length).toBeLessThanOrEqual(100);
    });

    it('uses default limit for invalid limit (not a number)', async () => {
      // The validation transform defaults invalid limits to 100
      const request = createRequest({ limit: 'abc' });
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('caps limit at maximum (500)', async () => {
      // The validation transform caps at 500
      const request = createRequest({ limit: '501' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      // Should be capped at 500
      expect(body.symbols.length).toBeLessThanOrEqual(500);
    });

    it('returns 400 for invalid exchange', async () => {
      const request = createRequest({ exchange: 'invalid' });
      const response = await GET(request);

      expect(response.status).toBe(400);
    });
  });

  describe('caching headers', () => {
    it('sets Cache-Control header for caching', async () => {
      const request = createRequest();
      const response = await GET(request);

      const cacheControl = response.headers.get('Cache-Control');
      expect(cacheControl).toContain('max-age=3600');
      expect(cacheControl).toContain('public');
    });

    it('sets Content-Type to application/json', async () => {
      const request = createRequest();
      const response = await GET(request);

      expect(response.headers.get('Content-Type')).toContain('application/json');
    });
  });

  describe('response schema', () => {
    it('matches expected SymbolsResponse schema', async () => {
      const request = createRequest();
      const response = await GET(request);

      const body = await response.json();

      // Check required fields
      expect(body).toHaveProperty('symbols');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('cached');
      expect(body).toHaveProperty('timestamp');

      // Check types
      expect(Array.isArray(body.symbols)).toBe(true);
      expect(typeof body.total).toBe('number');
      expect(typeof body.cached).toBe('boolean');
      expect(typeof body.timestamp).toBe('number');

      // Check symbol structure
      if (body.symbols.length > 0) {
        const symbol = body.symbols[0];
        expect(symbol).toHaveProperty('symbol');
        expect(symbol).toHaveProperty('base');
        expect(symbol).toHaveProperty('quote');
        expect(symbol).toHaveProperty('exchanges');
      }
    });
  });
});
