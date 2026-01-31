import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getGuideBySlug, getGuideSlugs } from "@/lib/guides-content";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getGuideSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return { title: "Guide Not Found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenimpact.com";

  return {
    title: guide.title,
    description: guide.metaDescription,
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.metaDescription,
      url: `${siteUrl}/guides/${slug}`,
    },
    alternates: {
      canonical: `${siteUrl}/guides/${slug}`,
    },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokenimpact.com";

  // HowTo structured data for guides
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.h1,
    description: guide.metaDescription,
    step: guide.sections.map((section, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: section.heading,
      text: section.content.slice(0, 300) + "...",
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
        name: "Guides",
        item: `${siteUrl}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.h1,
        item: `${siteUrl}/guides/${slug}`,
      },
    ],
  };

  // Article structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.h1,
    description: guide.metaDescription,
    author: {
      "@type": "Organization",
      name: "Token Impact",
    },
    publisher: {
      "@type": "Organization",
      name: "Token Impact",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/guides/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="min-h-screen py-8 px-4 md:px-8">
        {/* Breadcrumbs */}
        <nav className="max-w-3xl mx-auto mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <li>
              <span className="text-foreground font-medium">Guide</span>
            </li>
          </ol>
        </nav>

        <article className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              {guide.h1}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {guide.intro}
            </p>
          </header>

          {/* CTA */}
          <div className="mb-10 p-6 bg-muted/50 rounded-lg border">
            <p className="text-foreground mb-4">
              Ready to find the best exchange for your trade?
            </p>
            <Button asChild size="lg">
              <Link href="/#main-content">
                Open Liquidity Calculator
              </Link>
            </Button>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 mb-12">
            {guide.sections.map((section, index) => (
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

          {/* Conclusion */}
          <section className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Key Takeaways
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {guide.conclusion}
            </p>
            <Button asChild>
              <Link href="/#main-content">
                {guide.ctaText}
              </Link>
            </Button>
          </section>

          {/* Other Guides */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Related Guides
            </h2>
            <div className="space-y-3">
              {getGuideSlugs()
                .filter((s) => s !== slug)
                .map((s) => {
                  const data = getGuideBySlug(s);
                  if (!data) return null;
                  return (
                    <Link
                      key={s}
                      href={`/guides/${s}`}
                      className="block p-4 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
                    >
                      <span className="font-medium text-foreground">
                        {data.h1}
                      </span>
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
