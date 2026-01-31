import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenimpact.com";

// FAQ data for both content and structured data
const faqs = [
  {
    question: "What is price impact in crypto trading?",
    answer:
      "Price impact is the difference between the quoted price and the actual execution price when you place a market order. It occurs because your order consumes liquidity in the orderbook, pushing the price up (for buys) or down (for sells). The larger your order relative to available liquidity, the higher the price impact.",
  },
  {
    question: "How much slippage should I expect on a $100,000 Bitcoin order?",
    answer:
      "Slippage on a $100,000 BTC order typically ranges from 0.01% to 0.5% depending on the exchange and market conditions. On high-liquidity exchanges like Binance, you might see 0.01-0.05%. On smaller exchanges, it could be 0.2-0.5% or more. Use Token Impact to see real-time estimates for your specific trade size.",
  },
  {
    question: "Which exchange has the deepest liquidity for Bitcoin?",
    answer:
      "Generally, Binance has the deepest BTC liquidity due to its high trading volume. However, liquidity varies by trading pair, time of day, and market conditions. For BTC-USD specifically, Coinbase often has competitive depth. Use Token Impact to compare real-time liquidity across exchanges before placing large orders.",
  },
  {
    question: "How is price impact different from trading fees?",
    answer:
      "Price impact is the cost of moving the market with your order. Trading fees are fixed percentages charged by the exchange (typically 0.1-0.5% per trade). For small orders, fees dominate. For large orders, price impact often exceeds fees significantly. Token Impact calculates price impact only; you should add exchange fees for total cost.",
  },
  {
    question: "Why does Token Impact show different results than my exchange?",
    answer:
      "Orderbooks change constantly. Token Impact fetches a snapshot at calculation time, but by the time you execute, the orderbook may have changed. Also, exchanges may show only partial depth, while we fetch the maximum available levels. Results are estimates for planning purposes, not guaranteed execution prices.",
  },
  {
    question: "What does 'volume percentage' mean in the results?",
    answer:
      "Volume percentage shows your order size as a percentage of the trading pair's 24-hour volume. A higher percentage suggests your order is large relative to typical trading activity, which often correlates with higher price impact. Orders exceeding 1% of daily volume may face significant slippage.",
  },
  {
    question: "Can I use Token Impact for DeFi or DEX trades?",
    answer:
      "Token Impact currently supports centralized exchanges only: Binance, Coinbase, and Kraken. DEX liquidity (Uniswap, Curve, etc.) uses different mechanisms (AMMs vs orderbooks) and would require different calculation methods. We may add DEX support in the future.",
  },
  {
    question: "How often is the orderbook data updated?",
    answer:
      "Orderbook data is fetched fresh for every calculation—we do not cache orderbook snapshots. Each time you click 'Compare', we query all three exchanges in real-time. The timestamp shown indicates when the data was captured. Data older than 5 seconds is flagged as potentially stale.",
  },
  {
    question: "What does 'insufficient liquidity' mean?",
    answer:
      "Insufficient liquidity means the exchange's orderbook doesn't have enough depth to fill your entire order. For example, if you want to buy 100 BTC but only 80 BTC of sell orders exist in the visible orderbook, we report a shortfall. This is rare for major pairs but common for smaller altcoins or very large orders.",
  },
  {
    question: "Should I split my order across multiple exchanges?",
    answer:
      "Splitting orders can reduce total price impact if one exchange has insufficient depth. However, you'll pay trading fees on each exchange and face operational complexity. Token Impact helps you compare: if one exchange shows significantly better pricing, it may be worth trading there entirely rather than splitting.",
  },
  {
    question: "Does price impact affect limit orders?",
    answer:
      "No, limit orders execute at your specified price or better. Price impact only affects market orders (immediate execution at current prices). However, large limit orders may take longer to fill or may not fill completely. Token Impact calculates impact for market orders only.",
  },
  {
    question: "Why is Kraken data sometimes slower to load?",
    answer:
      "Kraken's API has stricter rate limits (1 request per second) compared to Binance and Coinbase. We queue requests to avoid hitting these limits, which may cause slight delays. If Kraken times out, we still show results from the other exchanges.",
  },
  {
    question: "Is Token Impact free to use?",
    answer:
      "Yes, Token Impact is completely free. We earn commission when you sign up for exchanges through our affiliate links. This doesn't affect your trading fees or the accuracy of our calculations.",
  },
  {
    question: "How accurate are the price impact estimates?",
    answer:
      "Our estimates are based on real-time orderbook data and are highly accurate at the moment of calculation. However, actual execution may differ due to: (1) orderbook changes between calculation and execution, (2) hidden orders not visible in the orderbook, (3) other traders executing simultaneously. Use estimates for planning, not as guaranteed prices.",
  },
];

// Generate FAQPage structured data
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export const metadata: Metadata = {
  title: "FAQ | Crypto Price Impact & Slippage Questions | Token Impact",
  description:
    "Frequently asked questions about crypto price impact, slippage, and exchange liquidity. Learn how much slippage to expect on large orders and which exchange has the best liquidity.",
  keywords: [
    "crypto slippage faq",
    "price impact questions",
    "how much slippage $100k bitcoin",
    "which exchange has best liquidity",
    "crypto trading slippage explained",
    "binance vs coinbase liquidity",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/faq`,
    siteName: "Token Impact",
    title: "FAQ | Crypto Price Impact & Slippage Questions",
    description:
      "Frequently asked questions about crypto price impact, slippage, and exchange liquidity.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Token Impact - FAQ",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "FAQ | Crypto Price Impact & Slippage Questions",
    description:
      "Frequently asked questions about crypto price impact and exchange liquidity.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
};

export default function FAQPage() {
  return (
    <>
      {/* FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

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
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Common questions about price impact, slippage, and exchange
            liquidity
          </p>
        </header>

        {/* FAQ List */}
        <article className="max-w-2xl mx-auto">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <section
                key={index}
                className="bg-surface border border-border rounded-lg p-5"
              >
                <h2 className="text-foreground font-medium mb-3">
                  {faq.question}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {faq.answer}
                </p>
              </section>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/">
                Try the Calculator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Still have questions */}
          <div className="pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Still have questions?{" "}
              <a
                href="https://github.com/anthropics/claude-code/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Open an issue on GitHub
              </a>
            </p>
          </div>

          {/* Related Links */}
          <nav className="pt-8 border-t border-border mt-8">
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
                  href="/methodology"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  How we calculate
                </Link>
              </li>
            </ul>
          </nav>
        </article>
      </main>
    </>
  );
}
