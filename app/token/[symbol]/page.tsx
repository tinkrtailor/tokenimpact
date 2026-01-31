import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { getSymbolCatalog, getSymbolFromCatalog } from "@/lib/symbol-catalog";
import { Calculator } from "@/components/calculator";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ symbol: string }>;
}

// Token metadata for SEO content
const TOKEN_INFO: Record<string, { name: string; description: string }> = {
  BTC: {
    name: "Bitcoin",
    description: "The original cryptocurrency and largest by market cap. BTC is the most liquid crypto asset across all exchanges.",
  },
  ETH: {
    name: "Ethereum",
    description: "The leading smart contract platform. ETH has deep liquidity and is the second-most traded cryptocurrency.",
  },
  SOL: {
    name: "Solana",
    description: "A high-performance blockchain known for fast transactions. SOL is popular with traders and has growing liquidity.",
  },
  XRP: {
    name: "XRP",
    description: "Digital payment network and cryptocurrency. XRP has significant trading volume on major exchanges.",
  },
  DOGE: {
    name: "Dogecoin",
    description: "The original meme coin that became a major cryptocurrency. DOGE has substantial liquidity on all major exchanges.",
  },
  ADA: {
    name: "Cardano",
    description: "A proof-of-stake blockchain platform. ADA is widely traded with good liquidity depth.",
  },
  AVAX: {
    name: "Avalanche",
    description: "A fast, low-cost smart contract platform. AVAX has strong trading volume and liquidity.",
  },
  DOT: {
    name: "Polkadot",
    description: "A multi-chain protocol connecting blockchains. DOT is actively traded with decent orderbook depth.",
  },
  LINK: {
    name: "Chainlink",
    description: "The leading decentralized oracle network. LINK is essential DeFi infrastructure with strong liquidity.",
  },
  MATIC: {
    name: "Polygon",
    description: "Ethereum scaling solution. MATIC/POL is widely traded on all major exchanges.",
  },
  LTC: {
    name: "Litecoin",
    description: "One of the oldest cryptocurrencies, often called digital silver. LTC has deep liquidity across exchanges.",
  },
  SHIB: {
    name: "Shiba Inu",
    description: "A popular meme token with a large community. SHIB has significant volume but watch for slippage on large orders.",
  },
  UNI: {
    name: "Uniswap",
    description: "The leading decentralized exchange token. UNI has good liquidity on centralized exchanges.",
  },
  ATOM: {
    name: "Cosmos",
    description: "The internet of blockchains. ATOM has solid liquidity across major exchanges.",
  },
  XLM: {
    name: "Stellar",
    description: "A payment-focused blockchain network. XLM has consistent liquidity on major platforms.",
  },
  AAVE: {
    name: "Aave",
    description: "Leading DeFi lending protocol. AAVE has moderate liquidity - compare exchanges for large trades.",
  },
  ALGO: {
    name: "Algorand",
    description: "A pure proof-of-stake blockchain. ALGO liquidity varies - check real-time depth before trading.",
  },
  ARB: {
    name: "Arbitrum",
    description: "Ethereum Layer 2 scaling solution. ARB has growing liquidity on major exchanges.",
  },
  OP: {
    name: "Optimism",
    description: "Ethereum Layer 2 using optimistic rollups. OP liquidity is developing - compare exchanges.",
  },
  NEAR: {
    name: "NEAR Protocol",
    description: "A sharded, proof-of-stake blockchain. NEAR has moderate liquidity - compare before large trades.",
  },
  PEPE: {
    name: "Pepe",
    description: "A popular meme token. PEPE can have high slippage on large orders - always check depth.",
  },
};

// Top 30 symbols for static generation (prioritized by typical volume)
const TOP_SYMBOLS = [
  "BTC-USD", "BTC-USDT", "BTC-EUR",
  "ETH-USD", "ETH-USDT", "ETH-EUR",
  "SOL-USD", "SOL-USDT",
  "XRP-USD", "XRP-USDT",
  "DOGE-USD", "DOGE-USDT",
  "ADA-USD", "ADA-USDT",
  "AVAX-USD", "AVAX-USDT",
  "DOT-USD", "DOT-USDT",
  "LINK-USD", "LINK-USDT",
  "MATIC-USD", "MATIC-USDT",
  "LTC-USD", "LTC-USDT",
  "SHIB-USD", "SHIB-USDT",
  "UNI-USD", "UNI-USDT",
  "ARB-USDT",
  "PEPE-USDT",
];

export async function generateStaticParams() {
  return TOP_SYMBOLS.map((symbol) => ({ symbol }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params;
  const symbolInfo = getSymbolFromCatalog(symbol.toUpperCase());

  if (!symbolInfo) {
    return { title: "Symbol Not Found" };
  }

  const tokenInfo = TOKEN_INFO[symbolInfo.base];
  const tokenName = tokenInfo?.name ?? symbolInfo.base;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenimpact.com";

  const title = `${tokenName} Price Impact Calculator | Compare ${symbol.toUpperCase()} Slippage`;
  const description = `Calculate ${tokenName} (${symbol.toUpperCase()}) price impact across Binance, Coinbase, and Kraken. Find the best exchange for your ${symbolInfo.base} trade size.`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      url: `${siteUrl}/token/${symbol}`,
    },
    alternates: {
      canonical: `${siteUrl}/token/${symbol}`,
    },
  };
}

function CalculatorSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-4 lg:space-y-0 lg:flex lg:items-end lg:gap-4">
        <div className="flex-1">
          <Skeleton className="h-4 w-20 mb-1.5" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-1.5" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-4 w-16 mb-1.5" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export default async function TokenPage({ params }: PageProps) {
  const { symbol } = await params;
  const symbolInfo = getSymbolFromCatalog(symbol.toUpperCase());

  if (!symbolInfo) {
    notFound();
  }

  const tokenInfo = TOKEN_INFO[symbolInfo.base];
  const tokenName = tokenInfo?.name ?? symbolInfo.base;
  const allSymbols = getSymbolCatalog();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenimpact.com";

  // Find related symbols (same base asset, different quote)
  const relatedSymbols = allSymbols
    .filter((s) => s.base === symbolInfo.base && s.symbol !== symbolInfo.symbol)
    .slice(0, 5);

  // Find other popular tokens
  const otherTokens = TOP_SYMBOLS
    .filter((s) => !s.startsWith(symbolInfo.base))
    .slice(0, 8);

  // Breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tokenName,
        item: `${siteUrl}/token/${symbol}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen py-8 px-4 md:px-8">
        {/* Breadcrumbs */}
        <nav className="max-w-4xl mx-auto mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <li>
              <span className="text-foreground font-medium">
                {tokenName} ({symbolInfo.symbol})
              </span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            {tokenName} Price Impact Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare {symbolInfo.symbol} slippage across Binance, Coinbase, and Kraken.
            Find the best execution price for your trade size.
          </p>
        </header>

        {/* Pre-filled Calculator */}
        <main className="max-w-4xl mx-auto mb-12">
          <Suspense fallback={<CalculatorSkeleton />}>
            <Calculator
              initialSymbols={allSymbols}
              className="[&_[data-slot=pair-selector]]:animate-pulse"
            />
          </Suspense>
        </main>

        {/* Token Info */}
        {tokenInfo && (
          <section className="max-w-4xl mx-auto mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              About {tokenName}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {tokenInfo.description}
            </p>
          </section>
        )}

        {/* Exchange Availability */}
        <section className="max-w-4xl mx-auto mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Where to Trade {symbolInfo.symbol}
          </h2>
          <p className="text-muted-foreground mb-4">
            {symbolInfo.symbol} is available on:
          </p>
          <ul className="flex flex-wrap gap-2">
            {symbolInfo.exchanges.binance && (
              <li className="px-3 py-1.5 bg-muted rounded-md text-sm">Binance</li>
            )}
            {symbolInfo.exchanges.coinbase && (
              <li className="px-3 py-1.5 bg-muted rounded-md text-sm">Coinbase</li>
            )}
            {symbolInfo.exchanges.kraken && (
              <li className="px-3 py-1.5 bg-muted rounded-md text-sm">Kraken</li>
            )}
          </ul>
        </section>

        {/* Related Pairs */}
        {relatedSymbols.length > 0 && (
          <section className="max-w-4xl mx-auto mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Other {tokenName} Trading Pairs
            </h2>
            <div className="flex flex-wrap gap-3">
              {relatedSymbols.map((s) => (
                <Link
                  key={s.symbol}
                  href={`/token/${s.symbol}`}
                  className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm"
                >
                  {s.symbol}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Other Tokens */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Compare Other Cryptocurrencies
          </h2>
          <div className="flex flex-wrap gap-3">
            {otherTokens.map((s) => (
              <Link
                key={s}
                href={`/token/${s}`}
                className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm"
              >
                {s}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
