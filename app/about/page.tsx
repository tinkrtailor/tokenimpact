import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenimpact.com";

export const metadata: Metadata = {
  title: "About Token Impact | Crypto Liquidity Calculator",
  description:
    "Learn what price impact is, why it matters for large crypto trades, and how Token Impact helps you find the best exchange for your trade size.",
  keywords: [
    "what is price impact crypto",
    "crypto slippage explained",
    "exchange liquidity comparison",
    "large crypto trade cost",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/about`,
    siteName: "Token Impact",
    title: "About Token Impact | Crypto Liquidity Calculator",
    description:
      "Learn what price impact is, why it matters for large crypto trades, and how Token Impact helps you find the best exchange.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Token Impact - About",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "About Token Impact | Crypto Liquidity Calculator",
    description:
      "Learn what price impact is and why it matters for large crypto trades.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen py-8 px-4 md:px-8">
      {/* Header */}
      <header className="text-center mb-8 md:mb-12">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
          Token Impact
        </Link>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground mt-4">
          About Token Impact
        </h1>
      </header>

      {/* Content */}
      <article className="max-w-2xl mx-auto space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            What We Do
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Token Impact calculates the true cost of executing large crypto trades.
            Enter your trade size, and we show you the price impact across Binance,
            Coinbase, and Kraken in real-time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Why Price Impact Matters
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you place a market order, you don&apos;t get the quoted price. You get
            the average price across all the orders you consume in the orderbook.
          </p>
          <div className="bg-surface border border-border rounded-lg p-4 font-mono text-sm">
            <p className="text-muted-foreground">
              A <span className="text-foreground">$500</span> trade? Negligible difference.
            </p>
            <p className="text-muted-foreground mt-1">
              A <span className="text-foreground">$500,000</span> trade? Could cost you{" "}
              <span className="text-accent">thousands</span> in hidden slippage.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Who We&apos;re For
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong className="text-foreground">Traders</strong> optimizing execution on large orders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong className="text-foreground">Whales</strong> comparing exchange liquidity before moving size</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong className="text-foreground">DAOs</strong> planning treasury operations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong className="text-foreground">Analysts</strong> researching market depth</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            How It&apos;s Free
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Token Impact is free to use. We earn commission when you sign up for
            exchanges through our links. This doesn&apos;t affect your trading fees.
          </p>
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
                href="/methodology"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                How we calculate
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
