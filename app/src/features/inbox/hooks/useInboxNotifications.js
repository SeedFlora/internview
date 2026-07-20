import { useCallback, useState } from "react";
import { getInbox } from "@/api/inboxApi";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";

/**
 * Custom hook untuk fetch dan manage inbox notifications
 * Implements standardized error handling per BASELINE API contract
 *
 * @returns {Object} - { inboxData, inboxLoading, isInboxOpen, handleOpenChange, fetchInbox }
 */
export const useInboxNotifications = () => {
  const [inboxData, setInboxData] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchInbox = useCallback(async () => {
    if (inboxData.length > 0) {
      return;
    }

    setInboxLoading(true);
    setError(null);

    try {
      const response = await getInbox();

      // Use standardized response validation
      const { success, message, data } = handleApiResponse(response);

      if (!success) {
        setError(message);
        setInboxData([]);
        console.error("Failed to fetch inbox:", message);
        return;
      }

      setInboxData(data || []);
    } catch (error) {
      const errorMessage = normalizeErrorMessage(error, "Failed to fetch inbox");
      setError(errorMessage);
      setInboxData([]);
      console.error("Error fetching inbox:", error);
    } finally {
      setInboxLoading(false);
    }
  }, [inboxData.length]);

  const handleOpenChange = useCallback(
    (open) => {
      setIsInboxOpen(open);
      if (open) {
        fetchInbox();
      }
    },
    [fetchInbox],
  );

  return {
    inboxData,
    inboxLoading,
    isInboxOpen,
    handleOpenChange,
    fetchInbox,
    error,
  };
};
