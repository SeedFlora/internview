import React, { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBar } from "@/components/common/SearchBar";
import { CompanyListContainer } from "../components/list/CompanyListContainer";
import { CompanyFilterDropdown } from "../components/list/CompanyFilterDropdown";
import { useCompanies } from "../hooks/useCompanies";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { COMPANY_COMPARE_TABS } from "../constants/tabs";
import { isValidSearchQuery } from "@/helpers/validations";

export const CompaniesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const activeTab = searchParams.get("sort") || "all";

  const handleTabChange = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === "all") {
        next.delete("sort");
      } else {
        next.set("sort", value);
      }
      return next;
    });
  };

  const { companies, loading, hasMore, error, fetchCompanies } =
    useCompanies(searchQuery, activeTab);

  // Handle pagination trigger for infinite scroll
  const handleLoadMore = useCallback(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Intersection observer for infinite scroll
  const lastElementRef = useIntersectionObserver(
    loading && isValidSearchQuery(searchQuery),
    hasMore && !isValidSearchQuery(searchQuery),
    handleLoadMore,
    0.5
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_520px] md:items-start">
        <div className="space-y-2">
          <h1 className="font-plus-jakarta text-[30px] font-bold leading-[1.2] tracking-[-0.02em] text-slate-900 md:text-[36px] lg:text-[38px]">
            Explore Internship Companies
          </h1>
          <p className="max-w-[560px] font-inter text-[14px] leading-6 text-slate-600 md:text-[15px]">
            Temukan perusahaan yang sesuai minatmu, baca pengalaman mahasiswa lain, dan mulai pencarian magangmu.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-end md:pt-1">
          <div className="w-full md:w-[420px]">
            <SearchBar />
          </div>
          <CompanyFilterDropdown
            options={COMPANY_COMPARE_TABS}
            activeValue={activeTab}
            onChange={handleTabChange}
          />
        </div>
      </div>

      <div className="mt-8">
        <CompanyListContainer
          companies={companies}
          loading={loading}
          error={error}
          hasMore={hasMore}
          searchQuery={searchQuery}
          lastElementRef={lastElementRef}
        />
      </div>
    </div>
  );
};