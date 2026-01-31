import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbs navigation component.
 * Renders a list of links with chevron separators.
 * The last item is rendered as plain text (current page).
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      className={className}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-1.5 flex-wrap text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              )}
              {isLast || !item.href ? (
                <span className={isLast ? "text-foreground font-medium" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Generates JSON-LD structured data for breadcrumbs.
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${baseUrl}${item.href}` : undefined,
    })),
  };
}
