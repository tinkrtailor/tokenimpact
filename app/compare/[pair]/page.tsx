import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getComparisonBySlug, getComparisonSlugs } from "@/lib/comparison-data";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ pair: string }>;
}

export async function generateStaticParams() {
  const slugs = getComparisonSlugs();
  return slugs.map((pair) => ({ pair }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pair } = await params;
  const comparison = getComparisonBySlug(pair);

  if (!comparison) {
    return { title: "Comparison Not Found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenimpact.com";

  return {
    title: comparison.title,
    description: comparison.metaDescription,
    openGraph: {
      type: "article",
      title: comparison.title,
      description: comparison.metaDescription,
      url: `${siteUrl}/compare/${pair}`,
    },
    alternates: {
      canonical: `${siteUrl}/compare/${pair}`,
    },
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { pair } = await params;
  const comparison = getComparisonBySlug(pair);

  if (!comparison) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenimpact.com";

  // FAQ structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: comparison.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

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
        name: "Compare",
        item: `${siteUrl}/compare`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${comparison.exchange1} vs ${comparison.exchange2}`,
        item: `${siteUrl}/compare/${pair}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
                {comparison.exchange1} vs {comparison.exchange2}
              </span>
            </li>
          </ol>
        </nav>

        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              {comparison.h1}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {comparison.intro}
            </p>
          </header>

          {/* CTA */}
          <div className="mb-10 p-6 bg-muted/50 rounded-lg border">
            <p className="text-foreground mb-4">
              Compare {comparison.exchange1} and {comparison.exchange2} liquidity in real-time:
            </p>
            <Button asChild size="lg">
              <Link href="/#main-content">
                Open Liquidity Calculator
              </Link>
            </Button>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 mb-12">
            {comparison.sections.map((section, index) => (
              <section key={index}>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  {section.heading}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </section>
            ))}
          </div>

          {/* FAQs */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {comparison.faqs.map((faq, index) => (
                <div key={index} className="border-b border-border pb-6 last:border-0">
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Verdict */}
          <section className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              The Verdict
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {comparison.verdict}
            </p>
            <Button asChild>
              <Link href="/#main-content">
                Compare Now
              </Link>
            </Button>
          </section>

          {/* Other Comparisons */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Other Exchange Comparisons
            </h2>
            <div className="flex flex-wrap gap-3">
              {getComparisonSlugs()
                .filter((slug) => slug !== pair)
                .map((slug) => {
                  const data = getComparisonBySlug(slug);
                  if (!data) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/compare/${slug}`}
                      className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm"
                    >
                      {data.exchange1} vs {data.exchange2}
                    </Link>
                  );
                })}
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
