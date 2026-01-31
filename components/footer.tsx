import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:text-left">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <p>
              &copy; {currentYear} Token Impact
            </p>
            <p className="text-xs">
              We earn commission from partner links at no extra cost to you.
            </p>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/about"
              className="hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/methodology"
              className="hover:text-foreground transition-colors"
            >
              Methodology
            </Link>
            <Link
              href="/faq"
              className="hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
