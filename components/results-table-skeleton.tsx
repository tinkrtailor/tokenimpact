"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ResultsTableSkeletonProps {
  /** Number of rows to display */
  rows?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Skeleton loader for ResultsTable component.
 *
 * Matches the exact layout of the results table:
 * - Header row with column names
 * - Data rows with exchange, prices, impact, cost, and action columns
 */
export function ResultsTableSkeleton({
  rows = 3,
  className,
}: ResultsTableSkeletonProps) {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[140px]">
            <span className="flex items-center">
              Exchange
              <Skeleton className="ml-1 h-3.5 w-3.5" />
            </span>
          </TableHead>
          <TableHead className="text-right">
            <span className="flex items-center justify-end">
              Mid Price
              <Skeleton className="ml-1 h-3.5 w-3.5" />
            </span>
          </TableHead>
          <TableHead className="text-right">
            <span className="flex items-center justify-end">
              Avg Fill
              <Skeleton className="ml-1 h-3.5 w-3.5" />
            </span>
          </TableHead>
          <TableHead className="text-right">
            <span className="flex items-center justify-end">
              Impact
              <Skeleton className="ml-1 h-3.5 w-3.5" />
            </span>
          </TableHead>
          <TableHead className="text-right">
            <span className="flex items-center justify-end">
              Cost
              <Skeleton className="ml-1 h-3.5 w-3.5" />
            </span>
          </TableHead>
          <TableHead className="w-[100px] text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {/* Potential BEST badge on first row */}
                {i === 0 && <Skeleton className="h-4 w-8" />}
                {/* Exchange name */}
                <Skeleton className={cn("h-5", i === 0 ? "w-16" : "w-20")} />
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-5 w-20 ml-auto" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-5 w-20 ml-auto" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-5 w-14 ml-auto" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-5 w-24 ml-auto" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className={cn("h-7", i === 0 ? "w-16" : "w-14", "ml-auto")} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
