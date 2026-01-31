/**
 * SEO content section for the homepage.
 * Provides keyword-rich content below the calculator for search engine optimization.
 */
export function SeoContent() {
  return (
    <section className="max-w-4xl mx-auto mt-16 mb-8 px-4 space-y-8 text-muted-foreground">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Why Compare Exchange Liquidity Before Trading
        </h2>
        <p>
          When executing large cryptocurrency orders, the exchange you choose can mean the
          difference between a profitable trade and an expensive mistake. Each exchange has
          different orderbook depth - the amount of buy and sell orders at various price levels.
          Binance typically leads in USDT pair liquidity, while Coinbase and Kraken often have
          deeper USD orderbooks. For whale traders moving $100K or more, comparing liquidity
          across Binance vs Coinbase vs Kraken before trading is essential.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          How Price Impact Costs You Money
        </h2>
        <p>
          Price impact (also called slippage) occurs when your order is large enough to move the
          market. Instead of getting the quoted price, you &quot;walk the orderbook&quot; - buying
          at progressively higher prices or selling at progressively lower prices. A $500K Bitcoin
          buy might show 0.1% slippage on one exchange but 0.5% on another. That 0.4% difference
          is $2,000 lost to poor liquidity. Our crypto slippage calculator shows you exactly what
          each trade will cost across all major exchanges, helping you minimize trading costs.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Which Exchange Has the Best Prices
        </h2>
        <p>
          There&apos;s no single answer - it depends on what you&apos;re trading and how much.
          For BTC-USDT and ETH-USDT, Binance usually has the deepest orderbooks. For USD pairs
          like BTC-USD and ETH-USD, Coinbase and Kraken compete closely. For less common
          altcoins, liquidity varies significantly. The best exchange for large crypto orders
          changes based on market conditions, time of day, and recent trading activity. Use our
          orderbook depth comparison tool to check real-time liquidity before every significant
          trade.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Built for Crypto Whale Trading
        </h2>
        <p>
          Token Impact was designed for serious traders executing significant volume. Unlike
          basic price comparison tools, we analyze real orderbook depth to show you exactly what
          your trade will cost. Enter any quantity - from 1 BTC to 1,000 BTC - and see the true
          price impact across Binance, Coinbase, and Kraken. Whether you&apos;re a fund manager,
          OTC desk, or individual whale, our calculator helps you find the best execution venue
          and avoid unnecessary slippage costs.
        </p>
      </div>
    </section>
  );
}
