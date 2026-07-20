import { useState } from "react";
import { useCertificateVerification } from "../hooks/useCertificateVerification";
import { VerificationTableToolbar } from "../../shared/components/VerificationTableToolbar";
import { CertificateVerificationTable } from "../components/CertificateVerificationTable";
import { ReviewModal } from "../../shared/components/ReviewModal";

export function CertificateVerificationPage() {
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
  } = useCertificateVerification({ search, statusFilter });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificate Verification</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage student certificate submission requests
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <VerificationTableToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchPlaceholder="Search by student or certificate..."
        />
        <CertificateVerificationTable
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
        entityLabel="Certificate Request"
      />
    </div>
  );
}
