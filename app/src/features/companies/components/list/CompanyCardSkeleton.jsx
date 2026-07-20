import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton/loading placeholder untuk CompanyCardHorizontal
 */
export const CompanyCardSkeleton = () => (
  <div className="min-h-[186px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <Skeleton className="mb-3 h-11 w-11 rounded-xl" />
    <Skeleton className="mb-2 h-4 w-4/5" />
    <Skeleton className="mb-2 h-4 w-3/5" />
    <Skeleton className="mb-1 h-4 w-1/2" />
    <div className="mt-1">
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
  </div>
);
