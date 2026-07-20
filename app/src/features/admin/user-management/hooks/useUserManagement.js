import { useCallback, useEffect, useRef, useState } from "react";
import { getAllUsers, setUserAsAdmin } from "@/api/userApi";
import { normalizeErrorMessage } from "@/helpers/apiUtils";
import { useIntersectionObserver } from "@/features/companies/hooks/useIntersectionObserver";

const PAGE_LIMIT = 15;

/**
 * @typedef {"User" | "Admin"} UserRole
 */

/**
 * @typedef {Object} UserManagementUser
 * @property {string|number} id
 * @property {string|number|null} userId
 * @property {string} name
 * @property {string} email
 * @property {UserRole} role
 * @property {string} region
 * @property {string} department
 * @property {string} major
 * @property {string} registeredAt
 * @property {string|null} cursorSource
 */

function normalizeRole(role) {
  if (String(role).toLowerCase() === "admin") {
    return "Admin";
  }
  return "User";
}

function formatDateTime(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value) || "-";
  }
  return parsed.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function mapApiUserToViewModel(user) {
  const email = user?.email || "";
  const registeredAt = user?.registeredAt ?? null;
  const userId = user?.userId ?? null;

  return {
    id: userId ?? email ?? `${user?.fullName ?? "unknown"}-${registeredAt ?? Date.now()}`,
    userId,
    name: user?.fullName || "-",
    email: email || "-",
    role: normalizeRole(user?.role),
    region: user?.regionName || "-",
    department: user?.deptName || "-",
    major: user?.majorName || "-",
    registeredAt: formatDateTime(registeredAt),
    cursorSource: registeredAt,
  };
}

export function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [lastBatchSize, setLastBatchSize] = useState(0);
  const [promotingUserId, setPromotingUserId] = useState(null);

  const nextCursorRef = useRef(null);
  const lastFetchedCursorRef = useRef(undefined);
  const searchTimeoutRef = useRef(null);

  const fetchUsers = useCallback(
    async (reset = false) => {
      const cursor = reset ? null : nextCursorRef.current;

      if (!reset && cursor === lastFetchedCursorRef.current) return;

      setLoading(true);
      if (reset) {
        setError("");
      }

      try {
        const response = await getAllUsers({ cursor, limit: PAGE_LIMIT, search });
        const apiItems = Array.isArray(response?.result) ? response.result : [];
        const mappedItems = apiItems.map(mapApiUserToViewModel);
        setLastBatchSize(Number(response?.meta?.size) || apiItems.length);

        if (reset) {
          setUsers(mappedItems);
        } else {
          setUsers((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            return [...prev, ...mappedItems.filter((item) => !existingIds.has(item.id))];
          });
        }

        const hasMoreFromApi = Boolean(response?.meta?.hasMore);
        let nextCursor = response?.meta?.nextCursor ?? null;
        if (hasMoreFromApi && (nextCursor === null || nextCursor === undefined || nextCursor === "")) {
          nextCursor = apiItems[apiItems.length - 1]?.registeredAt ?? null;
        }

        if (hasMoreFromApi && (nextCursor === null || nextCursor === undefined || nextCursor === "")) {
          nextCursorRef.current = null;
          setHasMore(false);
        } else {
          nextCursorRef.current = nextCursor;
          setHasMore(hasMoreFromApi);
        }

        lastFetchedCursorRef.current = cursor;
      } catch (err) {
        setError(normalizeErrorMessage(err, "Failed to load users"));
        setLastBatchSize(0);
        if (cursor === null) {
          setUsers([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      nextCursorRef.current = null;
      lastFetchedCursorRef.current = undefined;
      fetchUsers(true);
    }, 350);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [search, fetchUsers]);

  const sentinelRef = useIntersectionObserver(loading, hasMore, () => fetchUsers(false), 0.2);

  const handleSetAsAdmin = useCallback(async (user) => {
    if (user?.userId === null || user?.userId === undefined || user.role === "Admin") return;

    setPromotingUserId(user.userId);
    try {
      await setUserAsAdmin(user.userId);
      setUsers((prev) =>
        prev.map((item) =>
          item.userId === user.userId ? { ...item, role: "Admin" } : item
        )
      );
    } catch (err) {
      setError(normalizeErrorMessage(err, "Failed to set user as admin"));
    } finally {
      setPromotingUserId(null);
    }
  }, []);

  return {
    users,
    loading,
    hasMore,
    search,
    setSearch,
    error,
    lastBatchSize,
    sentinelRef,
    promotingUserId,
    handleSetAsAdmin,
  };
}
