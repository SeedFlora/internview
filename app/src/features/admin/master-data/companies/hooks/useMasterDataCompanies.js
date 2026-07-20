import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { getCompanyMasterData, adminCreateCompany, adminUpdateCompany, adminDeleteCompany } from "@/api/companyApi";
import { getCategories } from "@/api/categoryApi";
import { normalizeErrorMessage } from "@/helpers/apiUtils";

export function useMasterDataCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);

  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const nextCursorRef = useRef(null);
  const lastFetchedCursorRef = useRef(undefined);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    getCategories("companies").then((res) => {
      if (res.success) setCategories(res.result ?? []);
    });
  }, []);

  const fetchCompanies = useCallback(async (reset = false) => {
    const cursor = reset ? null : nextCursorRef.current;

    if (!reset && cursor === lastFetchedCursorRef.current) return;

    setLoading(true);
    try {
      const res = await getCompanyMasterData({ search, cursor });
      const items = res.result ?? [];

      if (reset) {
        setCompanies(items);
      } else {
        setCompanies((prev) => {
          const existingIds = new Set(prev.map((c) => c.companyId));
          return [...prev, ...items.filter((c) => !existingIds.has(c.companyId))];
        });
      }

      nextCursorRef.current = res.meta?.nextCursor ?? null;
      lastFetchedCursorRef.current = cursor;
      setHasMore(res.meta?.hasMore ?? false);
    } catch (err) {
      console.error(normalizeErrorMessage(err, "Failed to load companies"));
    } finally {
      setLoading(false);
    }
  }, [search]);

  const refresh = useCallback(() => {
    nextCursorRef.current = null;
    lastFetchedCursorRef.current = undefined;
    fetchCompanies(true);
  }, [fetchCompanies]);

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      nextCursorRef.current = null;
      lastFetchedCursorRef.current = undefined;
      fetchCompanies(true);
    }, 300);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [search, fetchCompanies]);

  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) {
        fetchCompanies(false);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchCompanies]);

  const openAdd = useCallback(() => setModal({ mode: "add", data: null }), []);
  const openEdit = useCallback((company) => setModal({ mode: "edit", data: company }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const handleSave = useCallback(async (payload) => {
    setSubmitting(true);
    try {
      if (modal?.mode === "add") {
        await adminCreateCompany(payload);
      } else {
        await adminUpdateCompany(modal.data.companyId, payload);
      }
      toast.success(modal?.mode === "add" ? "Company added" : "Company updated");
      closeModal();
      refresh();
    } catch (err) {
      // BUG FIX: without this catch a backend 400 (e.g. blank website) was
      // swallowed: no toast, the modal just stayed open and the button flipped
      // back from "Saving...", leaving the admin with no idea what went wrong.
      toast.error(normalizeErrorMessage(err, "Failed to save company"));
    } finally {
      setSubmitting(false);
    }
  }, [modal, closeModal, refresh]);

  const confirmDelete = useCallback((company) => setDeleteTarget(company), []);
  const cancelDelete = useCallback(() => setDeleteTarget(null), []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteCompany(deleteTarget.companyId);
      toast.success("Company deleted");
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      // Surface the backend reason (e.g. "Cannot delete a company that still
      // has reviews") instead of silently failing.
      toast.error(normalizeErrorMessage(err, "Failed to delete company"));
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, refresh]);

  return {
    companies,
    loading,
    hasMore,
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
  };
}
