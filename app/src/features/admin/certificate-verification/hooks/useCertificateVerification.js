import { useState, useRef, useCallback } from "react";
import {
  getCertificateVerificationList,
  reviewCertificateRequest,
} from "@/api/certificateApi";
import { useVerificationList } from "../../shared/hooks/useVerificationList";
import { useIntersectionObserver } from "@/features/companies/hooks/useIntersectionObserver";

export function useCertificateVerification({ search, statusFilter }) {
  const [modal, setModal] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const noteRef = useRef(null);

  const { items, loading, hasMore, fetchItems, refreshFromStart } = useVerificationList({
    fetchFn: getCertificateVerificationList,
    idField: "requestId",
    search,
    statusFilter,
  });

  const openModal = useCallback((requestId, action) => {
    setModal({ requestId, action });
    setReviewNote("");
    setTimeout(() => noteRef.current?.focus(), 50);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setReviewNote("");
  }, []);

  const handleSubmitReview = useCallback(async () => {
    if (!modal) return;
    setSubmitting(true);
    try {
      await reviewCertificateRequest(modal.requestId, {
              status: modal.action === "approve" ? "APPROVED" : "REJECTED",
              reviewNote,
            });
      closeModal();
      refreshFromStart();
    } finally {
      setSubmitting(false);
    }
  }, [modal, reviewNote, closeModal, refreshFromStart]);

  const sentinelRef = useIntersectionObserver(loading, hasMore, fetchItems);

  return {
    items,
    loading,
    hasMore,
    modal,
    reviewNote,
    setReviewNote,
    submitting,
    noteRef,
    sentinelRef,
    openModal,
    closeModal,
    handleSubmitReview,
  };
}
