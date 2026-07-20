import { useEffect, useState } from "react";
import { getCompanyBySlug } from "@/api/companyApi";
import { getRecruitmentProcessSummary, getReviewSummary } from "@/api/reviewApi";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";

const normalizeCompanyComparePayload = ({ companyData, reviewData, recruitmentData }) => ({
  company: companyData,
  reviewSummary: reviewData,
  internshipInformation: reviewData?.informationDetails || null,
  ratings: reviewData?.ratings || null,
  difficulty: recruitmentData?.difficulty || null,
  recruitmentStatistics: recruitmentData?.statistics || null,
});

const fetchSingleCompanyCompareData = async (slug) => {
  const [companyResponse, reviewSummaryResponse, recruitmentSummaryResponse] = await Promise.all([
    getCompanyBySlug(slug),
    getReviewSummary(slug),
    getRecruitmentProcessSummary(slug),
  ]);

  const companyResult = handleApiResponse(companyResponse);
  if (!companyResult.success || !companyResult.data) {
    throw new Error(companyResult.message || "Failed to load company details");
  }

  const reviewResult = handleApiResponse(reviewSummaryResponse);
  const recruitmentResult = handleApiResponse(recruitmentSummaryResponse);

  return normalizeCompanyComparePayload({
    companyData: companyResult.data,
    reviewData: reviewResult.success ? reviewResult.data : null,
    recruitmentData: recruitmentResult.success ? recruitmentResult.data : null,
  });
};

export const useCompareCompanies = (leftCompanySlug, rightCompanySlug) => {
  const [leftCompanyData, setLeftCompanyData] = useState(null);
  const [rightCompanyData, setRightCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!leftCompanySlug || !rightCompanySlug) return;

    let isCancelled = false;

    const fetchCompareData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [leftResult, rightResult] = await Promise.all([
          fetchSingleCompanyCompareData(leftCompanySlug),
          fetchSingleCompanyCompareData(rightCompanySlug),
        ]);

        if (isCancelled) return;

        setLeftCompanyData(leftResult);
        setRightCompanyData(rightResult);
      } catch (err) {
        if (isCancelled) return;
        setLeftCompanyData(null);
        setRightCompanyData(null);
        setError(normalizeErrorMessage(err, "Failed to load company comparison"));
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchCompareData();

    return () => {
      isCancelled = true;
    };
  }, [leftCompanySlug, rightCompanySlug]);

  return {
    leftCompanyData,
    rightCompanyData,
    loading,
    error,
  };
};
