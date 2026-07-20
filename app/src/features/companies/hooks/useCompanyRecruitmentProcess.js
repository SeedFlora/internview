import { useState, useEffect, useCallback, useRef } from "react";
import { getCompanyRecruitmentProcess } from "@/api/reviewApi";

export const useCompanyRecruitmentProcess = (companySlug) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const initializedRef = useRef(false);

  const fetchMore = useCallback(async (currentCursor) => {
    if (!companySlug || loading) return;
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 10, ...(currentCursor ? { cursor: currentCursor } : {}) };
      const res = await getCompanyRecruitmentProcess(companySlug, params);
      if (res.success) {
        setItems((prev) => [...prev, ...(res.result ?? [])]);
        setHasMore(res.meta?.hasMore ?? false);
        const last = res.result?.at(-1);
        if (last) setCursor(last.internshipDetailId);
      } else {
        setError(res.message || "Gagal memuat data rekrutmen");
      }
    } catch (err) {
      setError(err.message || "Gagal memuat data rekrutmen");
    } finally {
      setLoading(false);
    }
  }, [companySlug]);

  useEffect(() => {
    if (!companySlug || initializedRef.current) return;
    initializedRef.current = true;
    fetchMore(null);
  }, [companySlug, fetchMore]);

  const loadMore = () => fetchMore(cursor);

  return { items, loading, error, hasMore, loadMore };
};
