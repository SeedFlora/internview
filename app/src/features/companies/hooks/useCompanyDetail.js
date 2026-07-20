import { useState, useEffect } from "react";
import { getCompanyBySlug } from "@/api/companyApi";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";

/**
 * Custom hook untuk fetch company detail berdasarkan slug
 * Implements standardized error handling per BASELINE API contract
 *
 * @param {string} slug - Company slug identifier
 * @returns {Object} - { company, loading, error }
 */
export const useCompanyDetail = (slug) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchCompanyDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getCompanyBySlug(slug);

        // Use standardized response validation
        const { success, message, data } = handleApiResponse(response);

        if (!success) {
          setError(message);
          setCompany(null);
          return;
        }

        setCompany(data);
      } catch (err) {
        const errorMessage = normalizeErrorMessage(err, "Failed to fetch company details");
        console.error("Error fetching company details:", err);
        setError(errorMessage);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetail();
  }, [slug]);

  return { company, loading, error };
};