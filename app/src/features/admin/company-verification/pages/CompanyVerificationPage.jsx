import { useState } from "react";
import { useCompanyVerification } from "../hooks/useCompanyVerification";
import { VerificationTableToolbar } from "../../shared/components/VerificationTableToolbar";
import { CompanyVerificationTable } from "../components/CompanyVerificationTable";
import { ReviewModal } from "../../shared/components/ReviewModal";

export function CompanyVerificationPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    items,
    loading,
    sentinelRef,
    modal,
    reviewNote,
    setReviewNote,
    submitting,
    noteRef,
    openModal,
    closeModal,
    handleSubmitReview,
  } = useCompanyVerification({ search, statusFilter });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Verification</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage company submission requests
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <VerificationTableToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchPlaceholder="Search by company or submitter..."
        />
        <CompanyVerificationTable
          items={items}
          loading={loading}
          sentinelRef={sentinelRef}
          onApprove={(id) => openModal(id, "approve")}
          onReject={(id) => openModal(id, "reject")}
        />
      </div>

      <ReviewModal
        modal={modal}
        reviewNote={reviewNote}
        onNoteChange={setReviewNote}
        onClose={closeModal}
        onSubmit={handleSubmitReview}
        submitting={submitting}
        noteRef={noteRef}
        entityLabel="Company Request"
      />
    </div>
  );
}
