import React from "react";
import { useParams } from "react-router-dom";
import { useCompanyDetail } from "../hooks/useCompanyDetail";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getSavedCompanies } from "@/api/userApi";
import { handleApiResponse } from "@/helpers/apiUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/Container";
import { CompanyGeneralInfoSection } from "../components/detail/CompanyGeneralInfoSection";
import { CompanyTabsPanel } from "../components/tabs/CompanyTabsPanel";

export const CompanyDetailPage = () => {
  const { companySlug } = useParams();
  const { company, loading, error } = useCompanyDetail(companySlug);
  const { isAuthenticated } = useAuth();
  const [savedCompanySlugs, setSavedCompanySlugs] = useState([]);

  useEffect(() => {
    const loadSavedCompanies = async () => {
      if (!isAuthenticated) {
        setSavedCompanySlugs([]);
        return;
      }

      try {
        const response = await getSavedCompanies(null, 200);
        const { success, data } = handleApiResponse(response);

        if (!success) {
          setSavedCompanySlugs([]);
          return;
        }

        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        const slugs = items
          .map((item) => item?.companySlug ?? item?.slug ?? item?.company?.companySlug)
          .filter(Boolean);

        setSavedCompanySlugs(slugs);
      } catch {
        setSavedCompanySlugs([]);
      }
    };

    loadSavedCompanies();
  }, [companySlug, isAuthenticated]);

  const resolvedIsSaved =
    savedCompanySlugs.includes(companySlug) || Boolean(company?.isSaved);

  if (loading) {
    return (
      <>
        <section className="bg-gray-50 py-12">
          <Container>
            <div className="flex items-center space-x-6">
              <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </Container>
        </section>
        <Container className="py-8">
          <div className="flex gap-6 mb-8 border-b border-gray-200 pb-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-5 w-20" />)}
          </div>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 max-lg:col-span-12 space-y-6">
              <Skeleton className="h-40 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
            <div className="col-span-4 max-lg:col-span-12 space-y-6">
              <Skeleton className="h-56 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Company Not Found</h1>
          <p className="text-gray-600">The company you're looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Section 1: General Information (Full-width Hero Style) */}
      <CompanyGeneralInfoSection
        companySlug={companySlug}
        companyName={company.companyName}
        companyAbbreviation={company.companyAbbreviation}
        website={company.website}
        initialIsSaved={resolvedIsSaved}
        isPartner={company.isPartner}
        subcategoryName={company.subcategoryName}
        rating={company.rating}
        totalReviews={company.totalReviews}
      />

      {/* Section 2: Tabs Panel (Inside Container) */}
      <Container className="py-8">
        <CompanyTabsPanel
          companyId={company.companyId}
          companySlug={companySlug}
          companyName={company.companyName}
          bio={company.bio}
        />
      </Container>
    </>
  );
};