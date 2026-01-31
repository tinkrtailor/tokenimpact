import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Footer } from "@/components/footer";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenimpact.com";

export const metadata: Metadata = {
  title: "Token Impact | Crypto Price Impact Calculator - Compare Exchange Liquidity",
  description:
    "Calculate the true cost of large crypto trades. Compare price impact across Binance, Coinbase, and Kraken in real-time. Free tool for traders and whales.",
  keywords: [
    "crypto price impact calculator",
    "crypto slippage calculator",
    "compare exchange liquidity",
    "best exchange for large crypto orders",
    "crypto orderbook depth comparison",
  ],
  authors: [{ name: "Token Impact" }],
  creator: "Token Impact",
  metadataBase: new URL(siteUrl),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
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
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <NuqsAdapter>
          <div className="flex-1">{children}</div>
          <Footer />
        </NuqsAdapter>
      </body>
    </html>
  );
}
