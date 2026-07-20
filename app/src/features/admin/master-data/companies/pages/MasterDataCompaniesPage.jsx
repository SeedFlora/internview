import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { useMasterDataCompanies } from "../hooks/useMasterDataCompanies";
import { VerificationSkeletonRow } from "@/features/admin/shared/components/VerificationSkeletonRow";
import { CompanyFormModal, DeleteConfirmModal } from "../components";

export function MasterDataCompaniesPage() {
  const {
    companies,
    loading,
    sentinelRef,
    search,
    setSearch,
    categories,
    modal,
    submitting,
    openAdd,
    openEdit,
    closeModal,
    handleSave,
    deleteTarget,
    deleting,
    confirmDelete,
    cancelDelete,
    handleDelete,
  } = useMasterDataCompanies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Data - Companies</h1>
        <p className="mt-1 text-sm text-gray-500">Manage company records</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Plus size={16} />
            Add Company
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Company Name</th>
                <th className="px-4 py-3">Abbreviation</th>
                <th className="px-4 py-3">Subcategory</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Reviews</th>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && companies.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <VerificationSkeletonRow key={i} colCount={7} />
                ))
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    No companies found.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.companyId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{company.companyName}</td>
                    <td className="px-4 py-3 text-gray-600">{company.companyAbbreviation ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{company.subcategoryName ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{company.website ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{company.totalReviews ?? 0}</td>
                    <td className="px-4 py-3 text-gray-600">{company.isPartner ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(company)}
                          className="rounded p-1 text-blue-500 transition hover:bg-blue-50"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => confirmDelete(company)}
                          className="rounded p-1 text-red-500 transition hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {loading && companies.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            </div>
          )}
          <div ref={sentinelRef} className="h-1" />
        </div>
      </div>

      <CompanyFormModal
        modal={modal}
        categories={categories}
        onClose={closeModal}
        onSave={handleSave}
        submitting={submitting}
      />

      <DeleteConfirmModal
        target={deleteTarget}
        nameKey="companyName"
        title="Delete Company"
        deleting={deleting}
        onCancel={cancelDelete}
        onConfirm={handleDelete}
      />
    </div>
  );
}
