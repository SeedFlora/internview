import { Pencil } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function InfoItem({ label, value }) {
  return (
    <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 sm:p-4">
      <p className="font-inter text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-plus-jakarta text-sm font-semibold text-slate-900 sm:text-base">{value || "-"}</p>
    </div>
  );
}

export function PersonalInformationCard({ user, onEdit }) {
  return (
    <Card className="rounded-2xl border-slate-200 py-0 shadow-sm lg:col-span-2">
      <CardHeader className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-plus-jakarta text-xl font-semibold text-slate-900">Personal Information</h2>
            <p className="font-inter mt-1 text-sm text-slate-500">Your basic contact details</p>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
          <InfoItem label="First Name" value={user?.firstName} />
          <InfoItem label="Last Name" value={user?.lastName} />
          <InfoItem label="Phone Number" value={user?.phoneNumber} />
          <InfoItem label="Email Address" value={user?.email} />
        </div>
      </CardContent>
    </Card>
  );
}
