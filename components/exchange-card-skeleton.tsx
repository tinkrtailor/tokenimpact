"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ExchangeCardSkeletonProps {
  /** Additional class names */
  className?: string;
}

/**
 * Skeleton loader for ExchangeCard component.
 *
 * Matches the exact layout of an available ExchangeCard:
 * - Header with exchange name and potential badge
 * - Content with impact, cost, avg fill, and volume rows
 * - Footer with trade button
 */
export function ExchangeCardSkeleton({ className }: ExchangeCardSkeletonProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          {/* Exchange name */}
          <Skeleton className="h-6 w-24" />
          {/* Potential BEST badge */}
          <Skeleton className="h-5 w-12" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {/* Impact row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Total Cost row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Avg Fill row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Volume % row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {/* Trade button */}
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
