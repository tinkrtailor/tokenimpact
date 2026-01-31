import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { OfflineBanner } from "@/components/offline-banner";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenimpact.com";

export const metadata: Metadata = {
  title: "Token Impact | Compare Crypto Slippage - Binance vs Coinbase vs Kraken",
  description:
    "Calculate the true cost of large crypto trades. Compare price impact across Binance, Coinbase, and Kraken in real-time. Free slippage calculator for traders and whales.",
  keywords: [
    "crypto price impact calculator",
    "crypto slippage calculator",
    "compare exchange liquidity",
    "best exchange for large crypto orders",
    "crypto orderbook depth comparison",
    "binance vs coinbase liquidity",
    "binance vs kraken",
    "coinbase vs kraken",
    "crypto whale trading tool",
    "large crypto order execution",
    "minimize crypto slippage",
    "exchange liquidity comparison",
  ],
  authors: [{ name: "Token Impact" }],
  creator: "Token Impact",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Token Impact",
    title: "Token Impact | Compare Crypto Slippage - Binance vs Coinbase vs Kraken",
    description:
      "Calculate the true cost of large crypto trades. Compare price impact across Binance, Coinbase, and Kraken in real-time. Free tool for whales.",
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
    title: "Token Impact | Compare Crypto Slippage - Binance vs Coinbase vs Kraken",
    description:
      "Compare exchange liquidity for your trade. Calculate price impact across Binance, Coinbase, and Kraken.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Structured data for SEO
const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Token Impact",
  description:
    "Crypto price impact calculator comparing liquidity across exchanges",
  url: siteUrl,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Real-time orderbook analysis",
    "Multi-exchange comparison",
    "Price impact calculation",
    "Slippage estimation",
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Token Impact",
  url: siteUrl,
  logo: `${siteUrl}/images/logo/logo-full.svg`,
  sameAs: [],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Calculate Crypto Price Impact",
  description:
    "Learn how to compare cryptocurrency slippage across exchanges before executing large trades.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Select Trading Pair",
      text: "Choose the cryptocurrency pair you want to trade, such as BTC-USD, ETH-USDT, or SOL-EUR.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Enter Quantity",
      text: "Input the amount of cryptocurrency you want to buy or sell. Larger quantities will show more price impact.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Choose Direction",
      text: "Select whether you want to buy or sell. The best exchange may differ based on direction.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Compare Results",
      text: "Review the price impact percentage and total cost across Binance, Coinbase, and Kraken. Lower impact means better execution.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Trade on Best Exchange",
      text: "Click the trade button to open your account on the exchange with the lowest price impact for your trade size.",
    },
  ],
  totalTime: "PT1M",
  tool: {
    "@type": "HowToTool",
    name: "Token Impact Calculator",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* DNS prefetch for exchange APIs */}
        <link rel="dns-prefetch" href="https://api.binance.com" />
        <link rel="dns-prefetch" href="https://api.coinbase.com" />
        <link rel="dns-prefetch" href="https://api.kraken.com" />

        {/* Preconnect for frequently used origins */}
        <link rel="preconnect" href="https://api.binance.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.coinbase.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.kraken.com" crossOrigin="anonymous" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webApplicationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema),
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <OfflineBanner />
        <NuqsAdapter>
          <ErrorBoundary>
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </ErrorBoundary>
          <Footer />
          <Toaster />
        </NuqsAdapter>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
