import React from "react";
import { useSkeletonPreferences } from "@/context/skeletonContext";
import { SkeletonLine } from "@/components/ui/skeleton";

/**
 * LoadingWrapper: Render `skeleton` node when `loading` and app prefers skeletons.
 * - props:
 *    loading: boolean
 *    skeleton: ReactNode (optional) — defaults to simple lines
 *    children: ReactNode — content to show when not loading
 */
export function LoadingWrapper({ loading, skeleton = null, children, className = "" }) {
  const { preferSkeleton } = useSkeletonPreferences();

  if (!loading) return <>{children}</>;

  if (preferSkeleton) {
    if (skeleton) return <>{skeleton}</>;

    // Default skeleton: title + two lines
    return (
      <div className={className}>
        <SkeletonLine height="h-6" width="w-3/4" className="mb-2" />
        <SkeletonLine height="h-4" width="w-1/2" />
      </div>
    );
  }

  // Fallback text spinner if skeleton preference disabled
  return <div className="text-muted-foreground">Loading...</div>;
}
