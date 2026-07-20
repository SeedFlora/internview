import { useState, useEffect, useCallback, useRef } from "react";
import { getCompanies, searchCompanies } from "@/api/companyApi";
import { isValidSearchQuery } from "@/helpers/validations";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";

/**
 * Custom hook untuk fetch dan manage companies data
 * Mendukung cursor-based pagination untuk list dan search functionality
 * Implements standardized error handling per BASELINE API contract
 *
 * @param {string} searchQuery - Query string untuk search
 * @returns {Object} - { companies, loading, hasMore, error, fetchCompanies }
 */
export const useCompanies = (searchQuery, sort = "all") => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const nextCursorRef = useRef(null);
  const lastFetchedCursorRef = useRef(undefined);

  const fetchCompanies = useCallback(async () => {
    // Guard: prevent duplicate requests for the same cursor
    const currentCursor = nextCursorRef.current;
    if (currentCursor === lastFetchedCursorRef.current) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = isValidSearchQuery(searchQuery)
        ? await searchCompanies(searchQuery)
        : await getCompanies(currentCursor, 15, sort);

      // Use standardized response validation
      const { success, message, data } = handleApiResponse(response);

      if (!success) {
        setError(message);
        setCompanies([]);
        return;
      }

      const newCompanies = data || [];

      if (isValidSearchQuery(searchQuery)) {
        // Search: replace all companies
        setCompanies(newCompanies);
        setHasMore(false);
        nextCursorRef.current = null;
      } else {
        // Pagination: append companies, avoid duplicates
        setCompanies((prev) => {
          const existingIds = new Set(prev.map((c) => c.companyId));
          const uniqueNew = newCompanies.filter(
            (c) => !existingIds.has(c.companyId)
          );
          return [...prev, ...uniqueNew];
        });
        // Update nextCursor for next fetch and hasMore status
        nextCursorRef.current = response.meta?.nextCursor ?? null;
        setHasMore(response.meta?.hasMore ?? false);
      }

      lastFetchedCursorRef.current = currentCursor;
    } catch (err) {
      const errorMessage = normalizeErrorMessage(err, "Failed to fetch companies");
      console.error("Error fetching companies:", err);
      setError(errorMessage);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sort]);

  const resetCompanies = useCallback(() => {
    setCompanies([]);
    setHasMore(true);
    nextCursorRef.current = null;
    lastFetchedCursorRef.current = undefined;
    setError(null);
  }, []);

  // Reset dan refetch saat search query atau sort berubah
  useEffect(() => {
    resetCompanies();
    fetchCompanies();
  }, [searchQuery, sort]); // Only depend on searchQuery and sort to avoid infinite loops

  return {
    companies,
    loading,
    hasMore,
    error,
    fetchCompanies,
  };
};