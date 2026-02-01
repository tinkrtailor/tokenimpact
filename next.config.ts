import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Security headers
  async headers() {
    // Base CSP directives
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.binance.com https://api.coinbase.com https://api.kraken.com https://www.google-analytics.com",
      "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ad.a-ads.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ];

    // Only add upgrade-insecure-requests in production (breaks localhost on WebKit/Safari)
    if (!isDev) {
      cspDirectives.push("upgrade-insecure-requests");
    }

    const headers: { key: string; value: string }[] = [
      {
        key: "Content-Security-Policy",
        value: cspDirectives.join("; "),
      },
    ];

    // Only add HSTS in production (breaks localhost on WebKit/Safari)
    if (!isDev) {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    return [
      {
        source: "/(.*)",
        headers,
      },
    ];
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },

  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
