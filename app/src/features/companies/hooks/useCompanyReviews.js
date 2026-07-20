import { useState, useEffect } from "react";
import { getCompanyReviews } from "@/api/reviewApi";

export const useCompanyReviews = (companySlug) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companySlug) return;

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getCompanyReviews(companySlug);
        if (res.success) {
          setReviews(res.result ?? []);
        } else {
          setError(res.message || "Failed to load reviews");
        }
      } catch (err) {
        setError(err.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [companySlug]);

  return { reviews, loading, error };
};
