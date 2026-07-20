import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CompanyCardHorizontal } from "./CompanyCardHorizontal";
import { CompanyCardSkeleton } from "./CompanyCardSkeleton";


export const CompanyListContainer = ({
  companies,
  loading,
  error,
  hasMore,
  searchQuery,
  lastElementRef,
}) => {
  const navigate = useNavigate();
  const isEmpty = companies.length === 0;
  const isLoading = isEmpty && loading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CompanyCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isEmpty && !loading) {
    if (error) {
      return (
        <div className="col-span-full text-center py-8 text-gray-500">
          {error}
        </div>
      );
    }

    if (searchQuery) {
      return (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center">
          <h2 className="font-plus-jakarta text-2xl font-bold text-slate-900">Company Not Found</h2>
          <p className="max-w-sm font-inter text-slate-500">
            We don&apos;t have any reviews for &quot;{searchQuery}&quot; yet. Help other
            students by adding this company!
          </p>
          <Button
            className="mt-2 h-11 rounded-full bg-orange-500 px-8 font-inter text-sm font-semibold text-white hover:bg-orange-600"
            onClick={() => navigate("/companies/add")}
          >
            Add Company
          </Button>
        </div>
      );
    }

    return (
      <div className="col-span-full text-center py-8 text-gray-500">
        Tidak ada perusahaan tersedia.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map((company, index) => {
        const isLastElement = companies.length === index + 1;

        const card = (
          <CompanyCardHorizontal
            key={company.companyId}
            companyName={company.companyName}
            companyAbbreviation={company.companyAbbreviation}
            website={company.website}
            isPartner={company.isPartner}
            companySlug={company.companySlug}
            subcategoryName={company.subcategoryName}
            rating={company.rating}
            totalReviews={company.totalReviews}
          />
        );

        return isLastElement ? (
          <div ref={lastElementRef} key={company.companyId} className="h-full">
            {card}
          </div>
        ) : (
          card
        );
      })}

      {loading && companies.length > 0 && (
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <CompanyCardSkeleton key={`loading-${index}`} />
          ))}
        </>
      )}

      {!hasMore && companies.length > 0 && !searchQuery && (
        <div className="col-span-full text-center py-4 text-gray-500">
          Tidak ada perusahaan lagi
        </div>
      )}
    </div>
  );
};
