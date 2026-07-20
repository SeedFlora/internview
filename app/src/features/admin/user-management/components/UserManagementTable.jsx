import { Mail } from "lucide-react";
import { VerificationSkeletonRow } from "@/features/admin/shared/components/VerificationSkeletonRow";
import { UserRoleBadge } from "./UserRoleBadge";

export function UserManagementTable({ users, loading, error, sentinelRef, promotingUserId, onSetAsAdmin }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px] text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Region</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Major</th>
            <th className="px-4 py-3">Registered At</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading && users.length === 0 ? (
            Array.from({ length: 5 }).map((_, index) => (
              <VerificationSkeletonRow key={index} colCount={8} />
            ))
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                {error || "No users found."}
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-500" />
                    <span>{user.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3 text-gray-600">{user.region || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{user.department || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{user.major || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{user.registeredAt}</td>
                <td className="px-4 py-3">
                  {user.role === "Admin" ? (
                    <span className="text-sm text-gray-400">Already admin</span>
                  ) : (
                    <button
                      onClick={() => onSetAsAdmin(user)}
                      disabled={promotingUserId === user.userId}
                      className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {promotingUserId === user.userId ? "Setting..." : "Set as Admin"}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {loading && users.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        </div>
      )}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
