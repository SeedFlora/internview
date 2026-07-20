import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkeletonLine } from "@/components/ui/skeleton";

export function InboxDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Card className="rounded-2xl border-slate-200 py-0 shadow-sm">
        <CardHeader className="border-b border-slate-200 py-6">
          <SkeletonLine height="h-6" width="w-1/2" />
          <SkeletonLine height="h-4" width="w-1/3" className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-4 py-6">
          <SkeletonLine height="h-4" width="w-full" />
          <SkeletonLine height="h-4" width="w-3/4" />
          <SkeletonLine height="h-4" width="w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
