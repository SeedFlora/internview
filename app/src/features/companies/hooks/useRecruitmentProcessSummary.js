import { useState, useEffect } from "react";
import { getRecruitmentProcessSummary } from "@/api/reviewApi";

export const useRecruitmentProcessSummary = (companySlug) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companySlug) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getRecruitmentProcessSummary(companySlug);
        if (res.success) {
          setSummary(res.result);
        } else {
          setError(res.message || "Gagal memuat ringkasan rekrutmen");
        }
      } catch (err) {
        setError(err.message || "Gagal memuat ringkasan rekrutmen");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [companySlug]);

  return { summary, loading, error };
};
