import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveCompanyRequest,
  getCompanyRequest,
  rejectCompanyRequest,
} from "@/api/companyApi";
import { getCertificateRequest } from "@/api/certificateApi";
import { getAuditLog } from "@/api/auditApi";
import { toast } from "sonner";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";
import { buildActivityTimeline } from "@/features/inbox/utils/activityLog";

/**
 * Custom hook untuk manage inbox request details dengan API calls
 * Implements standardized error handling per BASELINE API contract
 *
 * @param {Object} props - Hook configuration
 * @param {string} props.id - Request ID
 * @param {string} props.type - Request type (COMPANY_REQUEST, UPLOAD_CERTIFICATES)
 * @param {Object} props.user - Current user object
 * @param {boolean} props.userLoading - User loading state
 * @param {Function} props.navigate - Navigation function
 * @returns {Object} - Request data and action handlers
 */
export const useInboxDetail = ({ id, type, user, userLoading, navigate }) => {
  const [requestData, setRequestData] = useState(null);
  const [reviewInformation, setReviewInformation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [auditLog, setAuditLog] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequestData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (type === "COMPANY_REQUEST") {
        response = await getCompanyRequest(id);
      } else if (type === "UPLOAD_CERTIFICATES") {
        response = await getCertificateRequest(id);
      } else {
        throw new Error("Unsupported request type");
      }

      // Use standardized response validation
      const { success, message, data } = handleApiResponse(response);

      if (!success) {
        setError(message);
        toast.error(message);
        setRequestData(null);
        setReviewInformation(null);
        return;
      }

      setRequestData(data?.requestDetails || null);
      setReviewInformation(data?.reviewInformation || null);
    } catch (err) {
      const errorMessage = normalizeErrorMessage(err, "Failed to fetch request details");
      setError(errorMessage);
      console.error("Error fetching request data:", err);
      toast.error(errorMessage);
      setRequestData(null);
      setReviewInformation(null);
    } finally {
      setLoading(false);
    }
  }, [id, type]);

  const fetchAuditTrail = useCallback(async () => {
    setAuditLoading(true);

    try {
      const response = await getAuditLog(type, id);

      // Use standardized response validation
      const { success, message, data } = handleApiResponse(response);

      if (!success) {
        console.warn("Failed to fetch audit log:", message);
        setAuditLog([]);
        return;
      }

      setAuditLog(data || []);
    } catch (error) {
      const errorMessage = normalizeErrorMessage(error, "Failed to fetch audit log");
      console.error("Error fetching audit log:", error);
      setAuditLog([]);
    } finally {
      setAuditLoading(false);
    }
  }, [id, type]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchRequestData(), fetchAuditTrail()]);
  }, [fetchRequestData, fetchAuditTrail]);

  const handleApprove = useCallback(async () => {
    if (type !== "COMPANY_REQUEST") {
      toast.error("Approve action not supported for this request type");
      return;
    }

    setActionLoading(true);

    try {
      const response = await approveCompanyRequest(id, reviewNote);

      // Use standardized response validation
      const { success, message } = handleApiResponse(response);

      if (!success) {
        toast.error(message);
        return;
      }

      toast.success(message || "Request approved successfully");
      setReviewNote("");
      await refreshAll();
    } catch (error) {
      const errorMessage = normalizeErrorMessage(error, "Failed to approve request");
      console.error("Error approving request:", error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  }, [id, refreshAll, reviewNote, type]);

  const handleReject = useCallback(async () => {
    if (type !== "COMPANY_REQUEST") {
      toast.error("Reject action not supported for this request type");
      return;
    }

    setActionLoading(true);

    try {
      const response = await rejectCompanyRequest(id, reviewNote);

      // Use standardized response validation
      const { success, message } = handleApiResponse(response);

      if (!success) {
        toast.error(message);
        return;
      }

      toast.success(message || "Request rejected successfully");
      setReviewNote("");
      await refreshAll();
    } catch (error) {
      const errorMessage = normalizeErrorMessage(error, "Failed to reject request");
      console.error("Error rejecting request:", error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  }, [id, refreshAll, reviewNote, type]);

  useEffect(() => {
    if (userLoading) {
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    if (id && type) {
      refreshAll();
    }
  }, [id, type, navigate, refreshAll, user, userLoading]);

  const timeline = useMemo(
    () => buildActivityTimeline(auditLog, requestData, reviewInformation),
    [auditLog, requestData, reviewInformation],
  );

  return {
    requestData,
    reviewInformation,
    loading,
    actionLoading,
    reviewNote,
    setReviewNote,
    auditLoading,
    timeline,
    handleApprove,
    handleReject,
    error,
  };
};
