  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Separator } from "@/components/ui/separator";
  import { SkeletonLine } from "@/components/ui/skeleton";
  import { getRequestStatusClass } from "@/features/inbox/utils/activityLog";

  export function InboxDetailView({
    requestId,
    requestData,
    reviewInformation,
    timeline,
    auditLoading,
  }) {
    const formatKeyLabel = (key) => key.replace(/([A-Z])/g, " $1").trim();

    const formatValue = (key, value) => {
      if (value === null || value === undefined) return "N/A";

      if (key.toLowerCase().includes("url") && value) {
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
            here
          </a>
        );
      }

      if (key.toLowerCase().includes("at") && value) {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date.toLocaleString("id-ID");
        }
      }

      if (typeof value === "boolean") return value ? "Yes" : "No";

      if (Array.isArray(value)) {
        if (value.length === 0) return "None";
        return value.map((item, index) => (
          <div key={index} className="text-sm">
            {typeof item === "object" ? JSON.stringify(item) : String(item)}
          </div>
        ));
      }

      if (typeof value === "object") {
        return JSON.stringify(value);
      }

      return String(value);
    };

    const renderObjectAsList = (obj, title) => {
      if (!obj) return null;

      return (
        <div>
          <h3 className="mb-4 font-plus-jakarta text-xl font-bold tracking-[-0.02em] text-slate-900">{title}</h3>
          <div className="space-y-3">
            {Object.entries(obj).map(([key, value]) => (
              <div
                key={key}
                className="grid gap-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 md:grid-cols-[220px_1fr] md:items-start md:gap-3"
              >
                <span className="font-inter text-sm capitalize text-slate-500">{formatKeyLabel(key)}:</span>
                <span className="break-words font-inter text-sm font-semibold text-slate-800">
                  {formatValue(key, value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Card className="rounded-3xl border-slate-200 py-0 shadow-sm">
          <CardHeader className="border-b border-slate-200 py-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="font-plus-jakarta text-3xl font-bold leading-tight tracking-[-0.02em] text-slate-900">
                  Inbox Details
                </CardTitle>
                <CardDescription className="mt-1 font-inter text-sm text-slate-500">
                  Request ID: #{requestId}
                </CardDescription>
              </div>
              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 font-inter text-xs font-bold tracking-wide ${getRequestStatusClass(reviewInformation?.status)}`}
              >
                {reviewInformation?.status || "UNKNOWN"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 py-6">
            {renderObjectAsList(requestData, "Request Details")}

            <Separator />

            {renderObjectAsList(reviewInformation, "Review Information")}

            <Separator />

            <div>
              <h3 className="mb-4 font-plus-jakarta text-xl font-bold tracking-[-0.02em] text-slate-900">Activity Log</h3>
              {auditLoading ? (
                <div className="space-y-2">
                  <SkeletonLine height="h-4" width="w-full" />
                  <SkeletonLine height="h-4" width="w-3/4" />
                </div>
              ) : timeline.length > 0 ? (
                <div className="space-y-3">
                  {timeline.map((log, index) => (
                    <div key={`${log.action}-${index}`} className={`rounded-2xl border-l-4 p-3 ${log.toneClass}`}>
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-2">
                        <div className="flex-1">
                          <p className="font-inter text-sm font-semibold text-slate-900">{log.action}</p>
                          {!log.hideActor && (
                            <p className="font-inter text-xs text-muted-foreground">{log.actor}</p>
                          )}
                        </div>

                        <span className="whitespace-nowrap font-inter text-xs text-muted-foreground">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString("id-ID") : "N/A"}
                        </span>
                      </div>

                      {!log.hideNotes && log.notes && (
                        <p className="font-inter text-xs italic text-muted-foreground">{log.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center font-inter text-sm text-muted-foreground">No activity log available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }