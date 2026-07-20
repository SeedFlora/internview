import { Link } from "react-router-dom";
import { Check, X, ExternalLink } from "lucide-react";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { VerificationSkeletonRow } from "../../shared/components/VerificationSkeletonRow";

export function CompanyVerificationTable({ items, loading, sentinelRef, onApprove, onReject }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Company Name</th>
            <th className="px-4 py-3">Website</th>
            <th className="px-4 py-3">Submitted By</th>
            <th className="px-4 py-3">Date Submitted</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading && items.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => <VerificationSkeletonRow key={i} colCount={6} />)
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                No company requests found.
              </td>
            </tr>
          ) : (
            items.map((req) => {
              const isPending = req.status?.toLowerCase() === "pending";
              return (
                <tr key={req.companyRequestId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/inbox/${req.companyRequestId}?type=COMPANY_REQUEST`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {req.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {req.website ? (
                      <a
                        href={req.website.startsWith("http") ? req.website : `https://${req.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        {req.website}
                        <ExternalLink size={12} className="shrink-0 text-gray-400" />
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{req.createdBy}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {req.createdAt ? req.createdAt.slice(0, 10) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={req.status?.toLowerCase()} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApprove(req.companyRequestId)}
                        disabled={!isPending}
                        className="rounded p-1 text-green-500 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Approve"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => onReject(req.companyRequestId)}
                        disabled={!isPending}
                        className="rounded p-1 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {loading && items.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        </div>
      )}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
