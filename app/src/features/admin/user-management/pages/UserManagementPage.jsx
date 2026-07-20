import { useUserManagement } from "../hooks/useUserManagement";
import {
  UserManagementTable,
  UserManagementToolbar,
} from "../components";

export function UserManagementPage() {
  const {
    users,
    loading,
    hasMore,
    search,
    setSearch,
    error,
    sentinelRef,
    promotingUserId,
    handleSetAsAdmin,
  } = useUserManagement();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">Manage user accounts and permissions</p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <UserManagementToolbar
          search={search}
          onSearchChange={setSearch}
        />

        <UserManagementTable
          users={users}
          loading={loading}
          error={error}
          sentinelRef={sentinelRef}
          promotingUserId={promotingUserId}
          onSetAsAdmin={handleSetAsAdmin}
        />
      </section>
      {!loading && users.length > 0 && !hasMore && (
        <p className="text-center text-sm text-gray-400">All users loaded.</p>
      )}
    </div>
  );
}
