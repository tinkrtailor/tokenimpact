import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenimpact.com";

interface DynamicMetadataParams {
  symbol?: string;
  side?: "buy" | "sell";
  quantity?: string;
}

/**
 * Generates dynamic metadata for pages with URL state params.
 * Used primarily for the calculator page when shared via URL.
 *
 * Per specs/url-state.md:
 * - When URL has valid params, generate OG tags like:
 *   title: "BTC-USD Price Impact | Token Impact"
 *   description: "Sell 10 BTC: Compare exchange liquidity"
 */
export function generateDynamicMetadata(
  params: DynamicMetadataParams
): Metadata {
  const { symbol, side, quantity } = params;

  // If no symbol, return base metadata
  if (!symbol) {
    return getBaseMetadata();
  }

  // Parse symbol to get base asset (e.g., "BTC" from "BTC-USD")
  const baseAsset = symbol.split("-")[0] ?? symbol;

  // Build dynamic title
  const title = `${symbol} Price Impact | Token Impact`;

  // Build dynamic description
  let description: string;
  if (quantity && side) {
    const sideText = side === "buy" ? "Buy" : "Sell";
    description = `${sideText} ${quantity} ${baseAsset}: Compare price impact across Binance, Coinbase, and Kraken`;
  } else if (quantity) {
    description = `Trade ${quantity} ${baseAsset}: Compare price impact across Binance, Coinbase, and Kraken`;
  } else {
    description = `Calculate ${symbol} price impact across Binance, Coinbase, and Kraken`;
  }

  // Build canonical URL with params
  const urlParams = new URLSearchParams();
  urlParams.set("s", symbol);
  if (side) urlParams.set("side", side);
  if (quantity) urlParams.set("qty", quantity);
  const canonicalUrl = `${siteUrl}/?${urlParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName: "Token Impact",
      title,
      description,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${symbol} Price Impact - Token Impact`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

/**
 * Returns base metadata for pages without dynamic params
 */
export function getBaseMetadata(): Metadata {
  return {
    title: "Token Impact | Crypto Price Impact Calculator - Compare Exchange Liquidity",
    description:
      "Calculate the true cost of large crypto trades. Compare price impact across Binance, Coinbase, and Kraken in real-time. Free tool for traders and whales.",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: "Token Impact",
      title: "Token Impact | Crypto Price Impact Calculator",
      description:
        "Calculate the true cost of large crypto trades. Compare price impact across Binance, Coinbase, and Kraken in real-time.",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Token Impact - Crypto Price Impact Calculator",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Token Impact | Crypto Price Impact Calculator",
      description:
        "Compare exchange liquidity for your trade. Calculate price impact across Binance, Coinbase, and Kraken.",
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: siteUrl,
    },
  };
}

/**
 * Validates URL state params for metadata generation.
 * Returns sanitized params or undefined values for invalid inputs.
 */
export function validateMetadataParams(searchParams: {
  s?: string;
  side?: string;
  qty?: string;
}): DynamicMetadataParams {
  const symbol = searchParams.s;
  const side =
    searchParams.side === "buy" || searchParams.side === "sell"
      ? searchParams.side
      : undefined;
  const quantity =
    searchParams.qty && !isNaN(parseFloat(searchParams.qty)) && parseFloat(searchParams.qty) > 0
      ? searchParams.qty
      : undefined;

  return { symbol, side, quantity };
}
