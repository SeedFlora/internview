import { Card, CardContent, CardHeader } from "@/components/ui/card";

function AcademicItem({ label, value }) {
  return (
    <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 sm:p-4">
      <p className="font-inter text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-plus-jakarta text-sm font-semibold text-slate-900 sm:text-base">{value || "-"}</p>
    </div>
  );
}

export function AcademicDetailsCard({ user }) {
  return (
    <Card className="rounded-2xl border-slate-200 py-0 shadow-sm">
      <CardHeader className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="font-plus-jakarta text-xl font-semibold text-slate-900">Academic Details</h2>
        <p className="font-inter mt-1 text-sm text-slate-500">Your department and major</p>
      </CardHeader>
      <CardContent className="space-y-3.5 px-5 py-5 sm:space-y-4 sm:px-6 sm:py-6">
        <AcademicItem label="Department" value={user?.deptName} />
        <AcademicItem label="Major" value={user?.majorName} />
      </CardContent>
    </Card>
  );
}
