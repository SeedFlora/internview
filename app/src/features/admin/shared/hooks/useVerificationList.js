import { useState, useCallback, useRef, useEffect } from "react";

export function useVerificationList({ fetchFn, idField, search, statusFilter }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const nextCursorRef = useRef(null);
  const lastFetchedCursorRef = useRef(undefined);

  const fetchItems = useCallback(async () => {
    const currentCursor = nextCursorRef.current;
    if (currentCursor === lastFetchedCursorRef.current) return;

    setLoading(true);
    try {
      const data = await fetchFn({ search, status: statusFilter, cursor: currentCursor });
      const newItems = data.result ?? [];

      if (currentCursor === null) {
        setItems(newItems);
      } else {
        setItems((prev) => {
          const existingIds = new Set(prev.map((r) => r[idField]));
          return [...prev, ...newItems.filter((r) => !existingIds.has(r[idField]))];
        });
      }

      nextCursorRef.current = data.meta?.nextCursor ?? null;
      setHasMore(data.meta?.hasMore ?? false);
      lastFetchedCursorRef.current = currentCursor;
    } catch {
      if (nextCursorRef.current === null) setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, idField, search, statusFilter]);

  useEffect(() => {
    setItems([]);
    setHasMore(true);
    nextCursorRef.current = null;
    lastFetchedCursorRef.current = undefined;
  }, [search, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const refreshFromStart = useCallback(() => {
    setItems([]);
    setHasMore(true);
    nextCursorRef.current = null;
    lastFetchedCursorRef.current = undefined;
    fetchItems();
  }, [fetchItems]);

  return { items, loading, hasMore, fetchItems, refreshFromStart };
}
