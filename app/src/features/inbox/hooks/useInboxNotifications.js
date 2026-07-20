import { useCallback, useEffect, useState } from "react";
import { getInbox, getUnreadCount, markInboxRead, markAllInboxRead } from "@/api/inboxApi";
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);

  // Fetch the unread count once on mount so the bell badge shows without the
  // user having to open the dropdown first.
  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      const { success, data } = handleApiResponse(res);
      if (success) setUnreadCount(data?.count ?? 0);
    } catch {
      // Not logged in / transient error -> leave the badge hidden.
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      refreshUnreadCount();
    }
  }, [refreshUnreadCount]);

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

  // Mark one notification read: optimistic local update, then persist. On
  // failure, refetch the count to stay consistent.
  const markRead = useCallback(
    async (inboxId) => {
      setInboxData((prev) =>
        prev.map((item) => (item.inboxId === inboxId ? { ...item, read: true } : item)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await markInboxRead(inboxId);
      } catch (err) {
        console.error(normalizeErrorMessage(err, "Failed to mark notification read"));
        refreshUnreadCount();
      }
    },
    [refreshUnreadCount],
  );

  const markAllRead = useCallback(async () => {
    setInboxData((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try {
      await markAllInboxRead();
    } catch (err) {
      console.error(normalizeErrorMessage(err, "Failed to mark all read"));
      refreshUnreadCount();
    }
  }, [refreshUnreadCount]);

  return {
    inboxData,
    inboxLoading,
    isInboxOpen,
    unreadCount,
    handleOpenChange,
    fetchInbox,
    markRead,
    markAllRead,
    error,
  };
};
