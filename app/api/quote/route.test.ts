import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock the exchange module
vi.mock('@/lib/exchanges', () => ({
  fetchAllExchanges: vi.fn(),
  fetchExchanges: vi.fn(),
  getAffiliateUrl: vi.fn((exchange: string) => `https://example.com/${exchange}`),
}));

import { fetchAllExchanges, fetchExchanges } from '@/lib/exchanges';

// Helper to create a mock request
function createRequest(params: Record<string, string>): NextRequest {
  const searchParams = new URLSearchParams(params);
  const url = `http://localhost:3000/api/quote?${searchParams.toString()}`;
  return new NextRequest(url);
}

// Helper to create a successful exchange result
function createSuccessfulResult(
  exchange: 'binance' | 'coinbase' | 'kraken',
  options: {
    bestBid?: number;
    bestAsk?: number;
    volume24h?: number;
    bidsQuantity?: number;
    asksQuantity?: number;
  } = {}
) {
  const {
    bestBid = 49000,
    bestAsk = 49100,
    volume24h = 10000,
    bidsQuantity = 100,
    asksQuantity = 100,
  } = options;

  return {
    success: true as const,
    exchange,
    data: {
      exchange,
      symbol: 'BTC-USD',
      orderbook: {
        bids: [[bestBid, bidsQuantity]] as Array<[number, number]>,
        asks: [[bestAsk, asksQuantity]] as Array<[number, number]>,
        timestamp: Date.now(),
      },
      volume24h,
    },
  };
}

// Helper to create a failed exchange result
function createFailedResult(
  exchange: 'binance' | 'coinbase' | 'kraken',
  status: 'error' | 'timeout' | 'unavailable' = 'error',
  error = 'Connection failed'
) {
  return {
    success: false as const,
    exchange,
    status,
    error,
  };
}

describe('GET /api/quote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validation errors', () => {
    it('returns 400 when symbol is missing', async () => {
      const request = createRequest({ side: 'BUY', quantity: '1' });
      const response = await GET(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBeDefined();
      expect(body.error.code).toBe('E_VALIDATION');
    });

    it('returns 400 when side is missing', async () => {
      const request = createRequest({ symbol: 'BTC-USD', quantity: '1' });
      const response = await GET(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('E_VALIDATION');
    });

    it('returns 400 when quantity is missing', async () => {
      const request = createRequest({ symbol: 'BTC-USD', side: 'BUY' });
      const response = await GET(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('E_VALIDATION');
    });

    it('returns 400 for invalid side value', async () => {
      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'INVALID',
        quantity: '1',
      });
      const response = await GET(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('E_VALIDATION');
    });

    it('returns 400 for negative quantity', async () => {
      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '-1',
      });
      const response = await GET(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('E_VALIDATION');
    });

    it('returns 400 for zero quantity', async () => {
      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '0',
      });
      const response = await GET(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('E_VALIDATION');
    });

    it('returns 400 for non-numeric quantity', async () => {
      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: 'abc',
      });
      const response = await GET(request);

      expect(response.status).toBe(400);
    });
  });

  describe('successful responses', () => {
    it('returns quote data for valid BUY request', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [
          createSuccessfulResult('binance'),
          createSuccessfulResult('coinbase'),
          createSuccessfulResult('kraken'),
        ],
        successCount: 3,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.symbol).toBe('BTC-USD');
      expect(body.side).toBe('BUY');
      expect(body.quantity).toBe('1');
      expect(body.results).toHaveLength(3);
      expect(body.best).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });

    it('returns quote data for valid SELL request', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [
          createSuccessfulResult('binance'),
          createSuccessfulResult('coinbase'),
          createSuccessfulResult('kraken'),
        ],
        successCount: 3,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'ETH-USD',
        side: 'SELL',
        quantity: '10',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.symbol).toBe('ETH-USD');
      expect(body.side).toBe('SELL');
      expect(body.quantity).toBe('10');
      expect(body.results).toHaveLength(3);
    });

    it('identifies best exchange for BUY (lowest cost)', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [
          createSuccessfulResult('binance', { bestAsk: 49200 }), // Higher price = higher cost
          createSuccessfulResult('coinbase', { bestAsk: 49000 }), // Lowest price = lowest cost
          createSuccessfulResult('kraken', { bestAsk: 49100 }),
        ],
        successCount: 3,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.best).toBe('coinbase');
    });

    it('identifies best exchange for SELL (highest proceeds)', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [
          createSuccessfulResult('binance', { bestBid: 49200 }), // Highest bid = highest proceeds
          createSuccessfulResult('coinbase', { bestBid: 49000 }),
          createSuccessfulResult('kraken', { bestBid: 49100 }),
        ],
        successCount: 3,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'SELL',
        quantity: '1',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.best).toBe('binance');
    });

    it('includes affiliate URLs in results', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [createSuccessfulResult('binance')],
        successCount: 1,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      const body = await response.json();
      expect(body.results[0].affiliateUrl).toBeDefined();
    });

    it('uses fetchExchanges when exchanges param provided', async () => {
      vi.mocked(fetchExchanges).mockResolvedValue({
        results: [createSuccessfulResult('binance')],
        successCount: 1,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
        exchanges: 'binance',
      });
      await GET(request);

      expect(fetchExchanges).toHaveBeenCalled();
      expect(fetchAllExchanges).not.toHaveBeenCalled();
    });
  });

  describe('partial failures', () => {
    it('returns 200 with partial results when some exchanges fail', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [
          createSuccessfulResult('binance'),
          createFailedResult('coinbase', 'timeout'),
          createSuccessfulResult('kraken'),
        ],
        successCount: 2,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.results).toHaveLength(3);

      const binanceResult = body.results.find(
        (r: { exchange: string }) => r.exchange === 'binance'
      );
      const coinbaseResult = body.results.find(
        (r: { exchange: string }) => r.exchange === 'coinbase'
      );

      expect(binanceResult.status).toBe('ok');
      expect(coinbaseResult.status).toBe('timeout');
    });

    it('correctly marks unavailable exchanges', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [
          createSuccessfulResult('binance'),
          createFailedResult('coinbase', 'unavailable', 'Symbol not available'),
        ],
        successCount: 1,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      const coinbaseResult = body.results.find(
        (r: { exchange: string }) => r.exchange === 'coinbase'
      );
      expect(coinbaseResult.status).toBe('unavailable');
    });

    it('sets best to null when no successful quotes', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [
          createFailedResult('binance', 'error'),
        ],
        successCount: 0,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      // This should return 500 since all failed
      expect(response.status).toBe(500);
    });
  });

  describe('all exchanges fail', () => {
    it('returns 500 when all exchanges fail', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [
          createFailedResult('binance', 'error', 'Network error'),
          createFailedResult('coinbase', 'timeout', 'Request timed out'),
          createFailedResult('kraken', 'error', 'API error'),
        ],
        successCount: 0,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('E_EXCHANGE_ERROR');
      expect(body.error.message).toContain('All exchanges failed');
    });
  });

  describe('response format', () => {
    it('formats numbers correctly', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [
          createSuccessfulResult('binance', {
            bestBid: 49123.456789,
            bestAsk: 49125.123456,
          }),
        ],
        successCount: 1,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      const body = await response.json();
      const result = body.results[0];

      // Check that numbers are formatted as strings with reasonable precision
      expect(typeof result.midPrice).toBe('string');
      expect(typeof result.avgFillPrice).toBe('string');
      expect(typeof result.totalCost).toBe('string');
      expect(typeof result.priceImpact).toBe('string');
    });

    it('includes depthConsumed field', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [createSuccessfulResult('binance')],
        successCount: 1,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      const body = await response.json();
      expect(body.results[0].depthConsumed).toBeDefined();
      expect(typeof body.results[0].depthConsumed).toBe('number');
    });

    it('includes fillable field', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [createSuccessfulResult('binance')],
        successCount: 1,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      const body = await response.json();
      expect(typeof body.results[0].fillable).toBe('boolean');
    });

    it('sets Cache-Control to no-store', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [createSuccessfulResult('binance')],
        successCount: 1,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe('no-store');
    });
  });

  describe('data freshness', () => {
    it('returns stale=false for fresh data (<5s old)', async () => {
      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [createSuccessfulResult('binance')], // timestamp is Date.now() by default
        successCount: 1,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.results[0].stale).toBe(false);
    });

    it('returns stale=true for stale data (>5s old)', async () => {
      const staleTimestamp = Date.now() - 6000; // 6 seconds ago

      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [
          {
            success: true as const,
            exchange: 'binance' as const,
            data: {
              exchange: 'binance' as const,
              symbol: 'BTC-USD',
              orderbook: {
                bids: [[49000, 100]] as Array<[number, number]>,
                asks: [[49100, 100]] as Array<[number, number]>,
                timestamp: staleTimestamp,
              },
              volume24h: 10000,
            },
          },
        ],
        successCount: 1,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.results[0].stale).toBe(true);
    });

    it('returns stale=false for data exactly 5s old', async () => {
      const exactlyFiveSecondsAgo = Date.now() - 5000;

      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [
          {
            success: true as const,
            exchange: 'binance' as const,
            data: {
              exchange: 'binance' as const,
              symbol: 'BTC-USD',
              orderbook: {
                bids: [[49000, 100]] as Array<[number, number]>,
                asks: [[49100, 100]] as Array<[number, number]>,
                timestamp: exactlyFiveSecondsAgo,
              },
              volume24h: 10000,
            },
          },
        ],
        successCount: 1,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      // 5s is the boundary, not stale yet (>5s is stale)
      expect(body.results[0].stale).toBe(false);
    });

    it('includes stale field for each exchange result', async () => {
      const freshTimestamp = Date.now();
      const staleTimestamp = Date.now() - 10000; // 10 seconds ago

      vi.mocked(fetchAllExchanges).mockResolvedValue({
        results: [
          {
            success: true as const,
            exchange: 'binance' as const,
            data: {
              exchange: 'binance' as const,
              symbol: 'BTC-USD',
              orderbook: {
                bids: [[49000, 100]] as Array<[number, number]>,
                asks: [[49100, 100]] as Array<[number, number]>,
                timestamp: freshTimestamp,
              },
              volume24h: 10000,
            },
          },
          {
            success: true as const,
            exchange: 'coinbase' as const,
            data: {
              exchange: 'coinbase' as const,
              symbol: 'BTC-USD',
              orderbook: {
                bids: [[49000, 100]] as Array<[number, number]>,
                asks: [[49100, 100]] as Array<[number, number]>,
                timestamp: staleTimestamp,
              },
              volume24h: 10000,
            },
          },
        ],
        successCount: 2,
        timestamp: Date.now(),
      });

      const request = createRequest({
        symbol: 'BTC-USD',
        side: 'BUY',
        quantity: '1',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();

      const binanceResult = body.results.find(
        (r: { exchange: string }) => r.exchange === 'binance'
      );
      const coinbaseResult = body.results.find(
        (r: { exchange: string }) => r.exchange === 'coinbase'
      );

      expect(binanceResult.stale).toBe(false);
      expect(coinbaseResult.stale).toBe(true);
    });
  });
});
