import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { UnauthenticatedModal } from "@/components/common/UnauthenticatedModal";
import { useCompanyDetail } from "@/features/companies/hooks/useCompanyDetail";
import { LoadingWrapper } from "@/components/ui/LoadingWrapper";
import { Container } from "@/components/layout/Container";
import { ReviewWriteForm } from "../components/ReviewWriteForm";
import { ReviewHeroSection } from "../components/ReviewHeroSection";
import { submitReview } from "@/api/reviewApi";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";

export const ReviewWritePage = () => {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { company, loading: companyLoading, error: companyError } = useCompanyDetail(companySlug);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return <UnauthenticatedModal redirectPath={location.pathname} />;
  }

  const handleFormSubmit = async (payload) => {
    setLoading(true);

    try {
      const response = await submitReview(companySlug, payload);
      const { success, message } = handleApiResponse(response);

      if (!success) {
        toast.error(message);
        return;
      }

      toast.success(message || "Review submitted successfully.");
      navigate(`/company/${companySlug}`);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(normalizeErrorMessage(error, "Failed to submit review. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/company/${companySlug}`);
  };

  if (companyLoading) {
    return <LoadingWrapper />;
  }

  if (companyError) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">{companyError}</p>
        </div>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-600">Company Not Found</h1>
          <p className="text-gray-600">The company you're looking for does not exist.</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <ReviewHeroSection company={company} />
      <ReviewWriteForm
        company={company}
        onSubmit={handleFormSubmit}
        loading={loading}
        onCancel={handleCancel}
      />
    </>
  );
};
