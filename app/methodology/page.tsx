import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenimpact.com";

export const metadata: Metadata = {
  title: "How We Calculate Price Impact | Token Impact Methodology",
  description:
    "Learn how Token Impact calculates crypto slippage and price impact. Our orderbook walking algorithm analyzes real-time depth from Binance, Coinbase, and Kraken.",
  keywords: [
    "how to calculate slippage",
    "crypto slippage calculation",
    "orderbook depth analysis",
    "price impact formula",
    "crypto trading cost calculation",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/methodology`,
    siteName: "Token Impact",
    title: "How We Calculate Price Impact | Token Impact Methodology",
    description:
      "Learn how Token Impact calculates crypto slippage using real-time orderbook data from major exchanges.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Token Impact - Methodology",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "How We Calculate Price Impact | Token Impact",
    description:
      "Learn how we calculate crypto slippage using real-time orderbook data.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: `${siteUrl}/methodology`,
  },
};

export default function MethodologyPage() {
  return (
    <main className="min-h-screen py-8 px-4 md:px-8">
      {/* Header */}
      <header className="text-center mb-8 md:mb-12">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          Token Impact
        </Link>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground mt-4">
          How We Calculate Price Impact
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Our methodology for calculating slippage and comparing exchange
          liquidity
        </p>
      </header>

      {/* Content */}
      <article className="max-w-2xl mx-auto space-y-10">
        {/* The Problem */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            The Problem with Quoted Prices
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            When you see a price like &quot;$95,000 per BTC&quot;, that&apos;s
            the mid-price—the average of the best bid and best ask. But when you
            actually execute a trade, you don&apos;t get that price. You get
            whatever prices are available in the orderbook.
          </p>
        </section>

        {/* Orderbook Walking */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Orderbook Walking Algorithm
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            To calculate true execution cost, we &quot;walk&quot; the orderbook,
            consuming liquidity level by level until your order is filled.
          </p>

          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-2">For Buy Orders</h3>
              <p className="text-muted-foreground text-sm">
                We consume the <span className="text-primary">ask side</span>{" "}
                from lowest to highest price. You pay the price at each level
                until your full quantity is filled.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-2">For Sell Orders</h3>
              <p className="text-muted-foreground text-sm">
                We consume the <span className="text-accent-alt">bid side</span>{" "}
                from highest to lowest price. You receive the price at each
                level until your full quantity is sold.
              </p>
            </div>
          </div>
        </section>

        {/* Example */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Worked Example
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Let&apos;s say you want to buy 10 BTC and the orderbook looks like
            this:
          </p>

          <div className="bg-surface border border-border rounded-lg overflow-hidden mb-4">
            <div className="border-b border-border px-4 py-2 bg-muted/30">
              <span className="text-sm text-muted-foreground font-medium">
                Ask Side (Sell Orders)
              </span>
            </div>
            <div className="divide-y divide-border font-mono text-sm">
              <div className="flex justify-between px-4 py-2">
                <span className="text-muted-foreground">$95,010</span>
                <span className="text-foreground">3.0 BTC</span>
              </div>
              <div className="flex justify-between px-4 py-2">
                <span className="text-muted-foreground">$95,005</span>
                <span className="text-foreground">2.0 BTC</span>
              </div>
              <div className="flex justify-between px-4 py-2">
                <span className="text-muted-foreground">$95,000</span>
                <span className="text-foreground">5.0 BTC</span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4 font-mono text-sm space-y-2">
            <p className="text-muted-foreground">
              <span className="text-foreground">Step 1:</span> Buy 5.0 BTC @
              $95,000 = $475,000
            </p>
            <p className="text-muted-foreground">
              <span className="text-foreground">Step 2:</span> Buy 2.0 BTC @
              $95,005 = $190,010
            </p>
            <p className="text-muted-foreground">
              <span className="text-foreground">Step 3:</span> Buy 3.0 BTC @
              $95,010 = $285,030
            </p>
            <div className="border-t border-border pt-2 mt-2">
              <p className="text-foreground">
                Total: 10.0 BTC for $950,040
              </p>
              <p className="text-muted-foreground">
                Average Fill Price: <span className="text-primary">$95,004</span>
              </p>
            </div>
          </div>
        </section>

        {/* Price Impact Formula */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Price Impact Formula
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Price impact measures how much worse your execution is compared to
            the mid-price:
          </p>

          <div className="bg-surface border border-border rounded-lg p-4 font-mono text-center">
            <p className="text-foreground">
              Price Impact = ((avgFillPrice - midPrice) / midPrice) × 100
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed mt-4">
            Using our example above, if the mid-price is $94,995:
          </p>

          <div className="bg-surface border border-border rounded-lg p-4 font-mono text-sm mt-3">
            <p className="text-muted-foreground">
              = (($95,004 - $94,995) / $94,995) × 100
            </p>
            <p className="text-muted-foreground">= ($9 / $94,995) × 100</p>
            <p className="text-foreground mt-1">
              = <span className="text-primary">0.0095%</span> price impact
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed mt-4 text-sm">
            For buy orders, positive impact means paying more than mid-price.
            For sell orders, negative impact means receiving less than
            mid-price.
          </p>
        </section>

        {/* Data Sources */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Data Sources
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We fetch real-time orderbook data directly from exchange APIs:
          </p>

          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-muted-foreground">
              <span className="bg-[#F0B90B] text-black text-xs font-bold px-1.5 py-0.5 rounded mt-0.5">
                BN
              </span>
              <div>
                <span className="text-foreground font-medium">Binance</span>
                <span className="text-sm ml-2">
                  /api/v3/depth — up to 5000 levels
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3 text-muted-foreground">
              <span className="bg-[#0052FF] text-white text-xs font-bold px-1.5 py-0.5 rounded mt-0.5">
                CB
              </span>
              <div>
                <span className="text-foreground font-medium">Coinbase</span>
                <span className="text-sm ml-2">
                  /products/book — top 50 levels (Level 2)
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3 text-muted-foreground">
              <span className="bg-[#5741D9] text-white text-xs font-bold px-1.5 py-0.5 rounded mt-0.5">
                KR
              </span>
              <div>
                <span className="text-foreground font-medium">Kraken</span>
                <span className="text-sm ml-2">
                  /0/public/Depth — up to 500 levels
                </span>
              </div>
            </li>
          </ul>
        </section>

        {/* Data Freshness */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Data Freshness
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                Orderbook data is fetched fresh for every calculation
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                Results show a timestamp indicating when data was captured
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                Data older than 5 seconds is flagged as potentially stale
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                24-hour volume data is cached for 5 minutes
              </span>
            </li>
          </ul>
        </section>

        {/* What We Return */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Calculation Outputs
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            For each exchange, we calculate:
          </p>

          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">
                    Field
                  </th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2 text-foreground font-mono text-xs">
                    avgFillPrice
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    Weighted average execution price
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-foreground font-mono text-xs">
                    totalCost
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    Total amount spent (buy) or received (sell)
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-foreground font-mono text-xs">
                    priceImpact
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    Percentage difference from mid-price
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-foreground font-mono text-xs">
                    volumePct
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    Your order as % of 24h volume
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-foreground font-mono text-xs">
                    depthConsumed
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    Number of orderbook levels consumed
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-foreground font-mono text-xs">
                    fillable
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    Whether full quantity can be filled
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Limitations */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Limitations
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">Snapshot data:</strong>{" "}
                Orderbooks change rapidly; actual execution may differ
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">No fees included:</strong>{" "}
                Trading fees vary by exchange tier and are not factored in
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">Market orders only:</strong>{" "}
                This calculates impact for immediate execution, not limit orders
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">Visible liquidity:</strong>{" "}
                Hidden orders and iceberg orders are not captured
              </span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <div className="pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              Try the Calculator
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Related Links */}
        <nav className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Learn more:</p>
          <ul className="flex flex-wrap gap-4 text-sm">
            <li>
              <Link
                href="/about"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                About Token Impact
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </nav>
      </article>
    </main>
  );
}
