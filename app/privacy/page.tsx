import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Token Impact",
  description:
    "Learn how Token Impact handles your data. We collect minimal anonymous analytics and use affiliate links. No personal information required.",
  openGraph: {
    title: "Privacy Policy | Token Impact",
    description:
      "Learn how Token Impact handles your data. We collect minimal anonymous analytics.",
  },
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to Calculator
        </Link>
      </div>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Privacy Policy
        </h1>

        <p className="text-lg text-muted-foreground">
          Last updated: January 2026
        </p>

        <p>
          Token Impact (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
          respects your privacy. This policy explains what data we collect and
          how we use it.
        </p>

        <h2 className="mt-8 text-xl font-semibold">What We Collect</h2>

        <h3 className="mt-6 text-lg font-medium">Anonymous Usage Analytics</h3>
        <p>
          We use Vercel Analytics to understand how people use Token Impact.
          This service is cookie-less and collects only anonymous, aggregated
          data such as:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Page views and navigation paths</li>
          <li>Browser and device type (anonymized)</li>
          <li>Geographic region (country level)</li>
          <li>Performance metrics (page load times)</li>
        </ul>
        <p>
          No personal information or IP addresses are stored. You cannot be
          individually identified from this data.
        </p>

        <h3 className="mt-6 text-lg font-medium">Affiliate Click Tracking</h3>
        <p>
          When you click a link to trade on an exchange, we record anonymous
          information about the click:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Which exchange was clicked</li>
          <li>The trading pair and quantity shown</li>
          <li>Timestamp of the click</li>
          <li>A random session identifier</li>
        </ul>
        <p>
          This helps us understand which exchanges are most useful and improve
          our service. We do not track what you do on the exchange websites.
        </p>

        <h3 className="mt-6 text-lg font-medium">Local Storage</h3>
        <p>
          Token Impact may store preferences in your browser&apos;s local
          storage, such as:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Recently used trading pairs (for convenience)</li>
        </ul>
        <p>
          This data never leaves your device and can be cleared through your
          browser settings.
        </p>

        <h2 className="mt-8 text-xl font-semibold">What We Don&apos;t Collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Personal information (name, email, phone)</li>
          <li>Account credentials or login information</li>
          <li>Wallet addresses or cryptocurrency holdings</li>
          <li>Trading history or financial information</li>
          <li>IP addresses or precise location data</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">Third Parties</h2>

        <h3 className="mt-6 text-lg font-medium">Vercel</h3>
        <p>
          Our website is hosted on Vercel. Vercel provides anonymous analytics
          and may collect standard server logs. See{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Vercel&apos;s Privacy Policy
          </a>
          .
        </p>

        <h3 className="mt-6 text-lg font-medium">Exchange Affiliate Links</h3>
        <p>
          When you click links to Binance, Coinbase, or Kraken, you are
          redirected to their websites. Each exchange has its own privacy
          policy. We receive anonymous commission data if you sign up or trade
          through our affiliate links.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Affiliate Disclosure</h2>
        <p>
          Token Impact earns commission from exchange partner links at no extra
          cost to you. This is how we keep the service free. Our comparisons are
          based on real orderbook data and are not influenced by affiliate
          relationships.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Your Rights</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Access your data:</strong> We don&apos;t collect personal
            data, so there&apos;s nothing to access.
          </li>
          <li>
            <strong>Delete your data:</strong> Clear your browser&apos;s local
            storage to remove any stored preferences.
          </li>
          <li>
            <strong>Opt out of analytics:</strong> Use a browser extension that
            blocks analytics, or enable Do Not Track.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">Do Not Track</h2>
        <p>
          We respect the Do Not Track (DNT) browser setting. If your browser
          sends a DNT signal, we will limit analytics collection where
          technically possible.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Children&apos;s Privacy</h2>
        <p>
          Token Impact is not intended for children under 18. We do not
          knowingly collect information from children.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Changes will be
          posted on this page with an updated revision date.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Contact</h2>
        <p>
          If you have questions about this privacy policy, please open an issue
          on our{" "}
          <a
            href="https://github.com/tokenimpact/tokenimpact"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub repository
          </a>
          .
        </p>

        <div className="mt-12 border-t border-border pt-6">
          <Link
            href="/"
            className="text-primary hover:underline"
          >
            &larr; Return to Calculator
          </Link>
        </div>
      </article>
    </main>
  );
}
