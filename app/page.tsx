import type { Metadata } from "next";
import { Suspense } from "react";
import {
  generateDynamicMetadata,
  validateMetadataParams,
} from "@/lib/metadata";
import { getSymbolCatalog } from "@/lib/symbol-catalog";
import { Calculator } from "@/components/calculator";
import { Skeleton } from "@/components/ui/skeleton";

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

function CalculatorSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Controls skeleton */}
      <div className="space-y-4 lg:space-y-0 lg:flex lg:items-end lg:gap-4">
        <div className="flex-1">
          <Skeleton className="h-4 w-20 mb-1.5" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-1.5" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-4 w-16 mb-1.5" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      {/* Results placeholder */}
      <div className="mt-8 text-center py-12">
        <Skeleton className="h-6 w-64 mx-auto" />
      </div>
    </div>
  );
}

export default function Home() {
  // Fetch symbols on server side
  const symbols = getSymbolCatalog();

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      {/* Header */}
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
          Token Impact
        </h1>
        <p className="mt-2 text-muted-foreground">
          Compare price impact across exchanges
        </p>
      </header>

      {/* Calculator */}
      <Suspense fallback={<CalculatorSkeleton />}>
        <Calculator initialSymbols={symbols} />
      </Suspense>
    </div>
  );
}
