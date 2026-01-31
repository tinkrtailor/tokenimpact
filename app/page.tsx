import type { Metadata } from "next";
import {
  generateDynamicMetadata,
  validateMetadataParams,
} from "@/lib/metadata";

interface PageProps {
  searchParams: Promise<{
    s?: string;
    side?: string;
    qty?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const validatedParams = validateMetadataParams(params);
  return generateDynamicMetadata(validatedParams);
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-semibold text-foreground">Token Impact</h1>
      <p className="mt-4 text-muted-foreground">
        Crypto price impact calculator
      </p>
      <div className="mt-8 flex gap-4">
        <span className="rounded-md bg-primary px-4 py-2 font-mono text-primary-foreground">
          BUY
        </span>
        <span className="rounded-md bg-[hsl(var(--accent-alt))] px-4 py-2 font-mono text-[hsl(var(--accent-alt-foreground))]">
          SELL
        </span>
      </div>
    </main>
  );
}
