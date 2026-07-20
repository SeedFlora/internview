import { useState, useEffect } from "react";
import { getLookupsByType } from "@/api/lookupApi";

export const useLookup = (type) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchLookups = async () => {
      try {
        setLoading(true);
        const response = await getLookupsByType(type);
        if (cancelled) return;

        const grouped = (response.result ?? []).reduce((acc, item) => {
          const code = item.lookupCode;
          if (!acc[code]) acc[code] = [];
          acc[code].push({ value: item.lookupValue, label: item.lookupDescription });
          return acc;
        }, {});

        setData(grouped);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLookups();
    return () => {
      cancelled = true;
    };
  }, [type]);

  return { data, loading, error };
};
