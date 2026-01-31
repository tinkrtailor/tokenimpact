import { describe, it, expect } from 'vitest';
import {
  calculatePriceImpact,
  type Orderbook,
} from './calculations';

// Helper to create test orderbooks
function createOrderbook(
  bids: Array<{ price: number; quantity: number }>,
  asks: Array<{ price: number; quantity: number }>
): Orderbook {
  return {
    bids: bids.map(({ price, quantity }) => ({ price, quantity })),
    asks: asks.map(({ price, quantity }) => ({ price, quantity })),
    timestamp: Date.now(),
  };
}

describe('calculatePriceImpact', () => {
  describe('BUY orders (walks asks)', () => {
    it('calculates impact for a BUY order that fills within first level', () => {
      const orderbook = createOrderbook(
        [{ price: 99, quantity: 100 }], // bids
        [{ price: 100, quantity: 10 }] // asks
      );

      const result = calculatePriceImpact({
        side: 'BUY',
        quantity: 5,
        orderbook,
      });

      // Mid price = (99 + 100) / 2 = 99.5
      expect(result.midPrice).toBe(99.5);
      expect(result.bestBid).toBe(99);
      expect(result.bestAsk).toBe(100);

      // Avg fill price = 100 (only one level consumed)
      expect(result.avgFillPrice).toBe(100);

      // Total cost = 5 * 100 = 500
      expect(result.totalCost).toBe(500);

      // Price impact = ((100 - 99.5) / 99.5) * 100 = ~0.503%
      expect(result.priceImpact).toBeCloseTo(0.503, 2);

      expect(result.fillable).toBe(true);
      expect(result.shortfall).toBe(0);
      expect(result.depthConsumed).toBe(1);
    });

    it('calculates impact for a BUY order spanning multiple levels', () => {
      const orderbook = createOrderbook(
        [{ price: 99, quantity: 100 }],
        [
          { price: 100, quantity: 5 },
          { price: 101, quantity: 5 },
          { price: 102, quantity: 10 },
        ]
      );

      const result = calculatePriceImpact({
        side: 'BUY',
        quantity: 15, // Will consume all of first two levels, 5 from third
        orderbook,
      });

      // Mid price = (99 + 100) / 2 = 99.5
      expect(result.midPrice).toBe(99.5);

      // Total cost = (5 * 100) + (5 * 101) + (5 * 102) = 500 + 505 + 510 = 1515
      expect(result.totalCost).toBe(1515);

      // Avg fill price = 1515 / 15 = 101
      expect(result.avgFillPrice).toBe(101);

      // Price impact = ((101 - 99.5) / 99.5) * 100 = ~1.507%
      expect(result.priceImpact).toBeCloseTo(1.507, 2);

      expect(result.fillable).toBe(true);
      expect(result.shortfall).toBe(0);
      expect(result.depthConsumed).toBe(3);
    });

    it('handles partial fill of a level for BUY order', () => {
      const orderbook = createOrderbook(
        [{ price: 99, quantity: 100 }],
        [{ price: 100, quantity: 10 }]
      );

      const result = calculatePriceImpact({
        side: 'BUY',
        quantity: 3,
        orderbook,
      });

      expect(result.avgFillPrice).toBe(100);
      expect(result.totalCost).toBe(300);
      expect(result.fillable).toBe(true);
      expect(result.depthConsumed).toBe(1);
    });

    it('handles volume percentage calculation for BUY order', () => {
      const orderbook = createOrderbook(
        [{ price: 99, quantity: 100 }],
        [{ price: 100, quantity: 100 }]
      );

      const result = calculatePriceImpact({
        side: 'BUY',
        quantity: 10,
        orderbook,
        volume24h: 1000,
      });

      // 10 / 1000 * 100 = 1%
      expect(result.volumePct).toBe(1);
    });
  });

  describe('SELL orders (walks bids)', () => {
    it('calculates impact for a SELL order that fills within first level', () => {
      const orderbook = createOrderbook(
        [{ price: 100, quantity: 10 }], // bids
        [{ price: 101, quantity: 100 }] // asks
      );

      const result = calculatePriceImpact({
        side: 'SELL',
        quantity: 5,
        orderbook,
      });

      // Mid price = (100 + 101) / 2 = 100.5
      expect(result.midPrice).toBe(100.5);
      expect(result.bestBid).toBe(100);
      expect(result.bestAsk).toBe(101);

      // Avg fill price = 100 (only one level consumed)
      expect(result.avgFillPrice).toBe(100);

      // Total cost (proceeds for sell) = 5 * 100 = 500
      expect(result.totalCost).toBe(500);

      // Price impact = ((100 - 100.5) / 100.5) * 100 = ~-0.498%
      // Negative because we receive less than mid
      expect(result.priceImpact).toBeCloseTo(-0.498, 2);

      expect(result.fillable).toBe(true);
      expect(result.shortfall).toBe(0);
      expect(result.depthConsumed).toBe(1);
    });

    it('calculates impact for a SELL order spanning multiple levels', () => {
      const orderbook = createOrderbook(
        [
          { price: 100, quantity: 5 },
          { price: 99, quantity: 5 },
          { price: 98, quantity: 10 },
        ],
        [{ price: 101, quantity: 100 }]
      );

      const result = calculatePriceImpact({
        side: 'SELL',
        quantity: 15,
        orderbook,
      });

      // Mid price = (100 + 101) / 2 = 100.5
      expect(result.midPrice).toBe(100.5);

      // Total proceeds = (5 * 100) + (5 * 99) + (5 * 98) = 500 + 495 + 490 = 1485
      expect(result.totalCost).toBe(1485);

      // Avg fill price = 1485 / 15 = 99
      expect(result.avgFillPrice).toBe(99);

      // Price impact = ((99 - 100.5) / 100.5) * 100 = ~-1.493%
      expect(result.priceImpact).toBeCloseTo(-1.493, 2);

      expect(result.fillable).toBe(true);
      expect(result.shortfall).toBe(0);
      expect(result.depthConsumed).toBe(3);
    });

    it('handles partial fill of a level for SELL order', () => {
      const orderbook = createOrderbook(
        [{ price: 100, quantity: 10 }],
        [{ price: 101, quantity: 100 }]
      );

      const result = calculatePriceImpact({
        side: 'SELL',
        quantity: 3,
        orderbook,
      });

      expect(result.avgFillPrice).toBe(100);
      expect(result.totalCost).toBe(300);
      expect(result.fillable).toBe(true);
      expect(result.depthConsumed).toBe(1);
    });

    it('handles volume percentage calculation for SELL order', () => {
      const orderbook = createOrderbook(
        [{ price: 100, quantity: 100 }],
        [{ price: 101, quantity: 100 }]
      );

      const result = calculatePriceImpact({
        side: 'SELL',
        quantity: 50,
        orderbook,
        volume24h: 1000,
      });

      // 50 / 1000 * 100 = 5%
      expect(result.volumePct).toBe(5);
    });
  });

  describe('Insufficient liquidity (fillable: false, shortfall)', () => {
    it('returns fillable: false when BUY order exceeds ask depth', () => {
      const orderbook = createOrderbook(
        [{ price: 99, quantity: 100 }],
        [
          { price: 100, quantity: 5 },
          { price: 101, quantity: 5 },
        ]
      );

      const result = calculatePriceImpact({
        side: 'BUY',
        quantity: 15, // Only 10 available
        orderbook,
      });

      expect(result.fillable).toBe(false);
      expect(result.shortfall).toBe(5);
      expect(result.depthConsumed).toBe(2);

      // Avg fill price based on what was filled
      // Total cost = (5 * 100) + (5 * 101) = 1005
      // Filled = 10
      expect(result.totalCost).toBe(1005);
      expect(result.avgFillPrice).toBe(100.5);
    });

    it('returns fillable: false when SELL order exceeds bid depth', () => {
      const orderbook = createOrderbook(
        [
          { price: 100, quantity: 5 },
          { price: 99, quantity: 5 },
        ],
        [{ price: 101, quantity: 100 }]
      );

      const result = calculatePriceImpact({
        side: 'SELL',
        quantity: 20, // Only 10 available
        orderbook,
      });

      expect(result.fillable).toBe(false);
      expect(result.shortfall).toBe(10);
      expect(result.depthConsumed).toBe(2);

      // Total proceeds = (5 * 100) + (5 * 99) = 995
      expect(result.totalCost).toBe(995);
      expect(result.avgFillPrice).toBe(99.5);
    });

    it('handles exact match of order to available liquidity', () => {
      const orderbook = createOrderbook(
        [{ price: 99, quantity: 100 }],
        [{ price: 100, quantity: 10 }]
      );

      const result = calculatePriceImpact({
        side: 'BUY',
        quantity: 10, // Exactly matches available
        orderbook,
      });

      expect(result.fillable).toBe(true);
      expect(result.shortfall).toBe(0);
      expect(result.avgFillPrice).toBe(100);
    });
  });

  describe('Edge cases', () => {
    describe('Zero quantity', () => {
      it('returns market data with zero impact for zero quantity BUY', () => {
        const orderbook = createOrderbook(
          [{ price: 99, quantity: 100 }],
          [{ price: 101, quantity: 100 }]
        );

        const result = calculatePriceImpact({
          side: 'BUY',
          quantity: 0,
          orderbook,
        });

        expect(result.midPrice).toBe(100);
        expect(result.bestBid).toBe(99);
        expect(result.bestAsk).toBe(101);
        expect(result.avgFillPrice).toBe(100); // Returns mid price
        expect(result.totalCost).toBe(0);
        expect(result.priceImpact).toBe(0);
        expect(result.fillable).toBe(true);
        expect(result.shortfall).toBe(0);
        expect(result.depthConsumed).toBe(0);
        expect(result.volumePct).toBe(0);
      });

      it('returns market data with zero impact for zero quantity SELL', () => {
        const orderbook = createOrderbook(
          [{ price: 99, quantity: 100 }],
          [{ price: 101, quantity: 100 }]
        );

        const result = calculatePriceImpact({
          side: 'SELL',
          quantity: 0,
          orderbook,
        });

        expect(result.midPrice).toBe(100);
        expect(result.avgFillPrice).toBe(100);
        expect(result.totalCost).toBe(0);
        expect(result.priceImpact).toBe(0);
        expect(result.fillable).toBe(true);
        expect(result.shortfall).toBe(0);
      });
    });

    describe('Empty orderbook', () => {
      it('returns fillable: false for empty asks (BUY order)', () => {
        const orderbook = createOrderbook(
          [{ price: 99, quantity: 100 }],
          [] // No asks
        );

        const result = calculatePriceImpact({
          side: 'BUY',
          quantity: 10,
          orderbook,
        });

        expect(result.fillable).toBe(false);
        expect(result.shortfall).toBe(10);
        expect(result.avgFillPrice).toBe(0);
        expect(result.totalCost).toBe(0);
        expect(result.midPrice).toBe(0);
        expect(result.bestBid).toBe(99);
        expect(result.bestAsk).toBe(0);
      });

      it('returns fillable: false for empty bids (SELL order)', () => {
        const orderbook = createOrderbook(
          [], // No bids
          [{ price: 101, quantity: 100 }]
        );

        const result = calculatePriceImpact({
          side: 'SELL',
          quantity: 10,
          orderbook,
        });

        expect(result.fillable).toBe(false);
        expect(result.shortfall).toBe(10);
        expect(result.avgFillPrice).toBe(0);
        expect(result.totalCost).toBe(0);
        expect(result.midPrice).toBe(0);
        expect(result.bestBid).toBe(0);
        expect(result.bestAsk).toBe(101);
      });

      it('handles completely empty orderbook', () => {
        const orderbook = createOrderbook([], []);

        const result = calculatePriceImpact({
          side: 'BUY',
          quantity: 10,
          orderbook,
        });

        expect(result.fillable).toBe(false);
        expect(result.shortfall).toBe(10);
        expect(result.avgFillPrice).toBe(0);
        expect(result.midPrice).toBe(0);
        expect(result.bestBid).toBe(0);
        expect(result.bestAsk).toBe(0);
        expect(result.volumePct).toBeNull();
      });
    });

    describe('Single level fills entire order', () => {
      it('calculates impact correctly for single-level BUY', () => {
        const orderbook = createOrderbook(
          [{ price: 99, quantity: 100 }],
          [{ price: 100, quantity: 1000 }]
        );

        const result = calculatePriceImpact({
          side: 'BUY',
          quantity: 500,
          orderbook,
        });

        expect(result.avgFillPrice).toBe(100);
        expect(result.totalCost).toBe(50000);
        expect(result.depthConsumed).toBe(1);
        expect(result.fillable).toBe(true);

        // Impact = ((100 - 99.5) / 99.5) * 100 = ~0.503%
        expect(result.priceImpact).toBeCloseTo(0.503, 2);
      });

      it('calculates impact correctly for single-level SELL', () => {
        const orderbook = createOrderbook(
          [{ price: 100, quantity: 1000 }],
          [{ price: 101, quantity: 100 }]
        );

        const result = calculatePriceImpact({
          side: 'SELL',
          quantity: 500,
          orderbook,
        });

        expect(result.avgFillPrice).toBe(100);
        expect(result.totalCost).toBe(50000);
        expect(result.depthConsumed).toBe(1);
        expect(result.fillable).toBe(true);

        // Impact = ((100 - 100.5) / 100.5) * 100 = ~-0.498%
        expect(result.priceImpact).toBeCloseTo(-0.498, 2);
      });
    });

    describe('Volume percentage edge cases', () => {
      it('returns null volumePct when volume24h is not provided', () => {
        const orderbook = createOrderbook(
          [{ price: 99, quantity: 100 }],
          [{ price: 100, quantity: 100 }]
        );

        const result = calculatePriceImpact({
          side: 'BUY',
          quantity: 10,
          orderbook,
          // volume24h not provided
        });

        expect(result.volumePct).toBeNull();
      });

      it('returns null volumePct when volume24h is zero', () => {
        const orderbook = createOrderbook(
          [{ price: 99, quantity: 100 }],
          [{ price: 100, quantity: 100 }]
        );

        const result = calculatePriceImpact({
          side: 'BUY',
          quantity: 10,
          orderbook,
          volume24h: 0,
        });

        expect(result.volumePct).toBeNull();
      });

      it('calculates large volume percentage correctly', () => {
        const orderbook = createOrderbook(
          [{ price: 99, quantity: 1000 }],
          [{ price: 100, quantity: 1000 }]
        );

        const result = calculatePriceImpact({
          side: 'BUY',
          quantity: 500,
          orderbook,
          volume24h: 100, // Order is 500% of daily volume
        });

        expect(result.volumePct).toBe(500);
      });
    });

    describe('Price precision', () => {
      it('handles fractional prices correctly', () => {
        const orderbook = createOrderbook(
          [{ price: 0.00001234, quantity: 1000000 }],
          [{ price: 0.00001235, quantity: 1000000 }]
        );

        const result = calculatePriceImpact({
          side: 'BUY',
          quantity: 100000,
          orderbook,
        });

        expect(result.midPrice).toBeCloseTo(0.000012345, 10);
        expect(result.avgFillPrice).toBe(0.00001235);
        expect(result.fillable).toBe(true);
      });

      it('handles large prices correctly', () => {
        const orderbook = createOrderbook(
          [{ price: 50000, quantity: 100 }],
          [{ price: 50001, quantity: 100 }]
        );

        const result = calculatePriceImpact({
          side: 'BUY',
          quantity: 1,
          orderbook,
        });

        expect(result.midPrice).toBe(50000.5);
        expect(result.avgFillPrice).toBe(50001);
        expect(result.totalCost).toBe(50001);
      });
    });

    describe('Depth consumed accuracy', () => {
      it('counts depth consumed correctly across many levels', () => {
        const orderbook = createOrderbook(
          [{ price: 99, quantity: 100 }],
          [
            { price: 100, quantity: 1 },
            { price: 101, quantity: 1 },
            { price: 102, quantity: 1 },
            { price: 103, quantity: 1 },
            { price: 104, quantity: 1 },
          ]
        );

        const result = calculatePriceImpact({
          side: 'BUY',
          quantity: 5,
          orderbook,
        });

        expect(result.depthConsumed).toBe(5);
        expect(result.fillable).toBe(true);
      });

      it('does not count levels beyond what is needed', () => {
        const orderbook = createOrderbook(
          [{ price: 99, quantity: 100 }],
          [
            { price: 100, quantity: 10 },
            { price: 101, quantity: 10 },
            { price: 102, quantity: 10 },
          ]
        );

        const result = calculatePriceImpact({
          side: 'BUY',
          quantity: 5, // Only needs part of first level
          orderbook,
        });

        expect(result.depthConsumed).toBe(1);
      });
    });
  });
});
