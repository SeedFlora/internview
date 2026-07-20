import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useAuth } from "@/hooks/useAuth";
import { TwoColumnLayout } from "@/components/layout";
import { ReviewItemCard } from "../cards/ReviewItemCard";
import { ReviewRatingsCard } from "../cards/ReviewRatingsCard";
import { CompanyInternedCTACard } from "../cards/CompanyInternedCTACard";
import { EmptyStateCard } from "../cards/EmptyStateCard";
import { useCompanyReviews } from "../../hooks/useCompanyReviews";

const ReviewListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ))}
  </div>
);

export const ReviewsTabContent = ({ companySlug, companyName, summaryData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { reviews, loading, error } = useCompanyReviews(companySlug);
  const lockedContainerRef = useRef(null);

  useEffect(() => {
    const container = lockedContainerRef.current;
    if (!container) return;

    const selector = [
      "a[href]",
      "button",
      "input",
      "select",
      "textarea",
      "[tabindex]",
    ].join(",");

    const elements = Array.from(container.querySelectorAll(selector));

    if (!isAuthenticated) {
      elements.forEach((element) => {
        if (!element.hasAttribute("data-prev-tabindex")) {
          const previousTabIndex = element.getAttribute("tabindex");
          element.setAttribute("data-prev-tabindex", previousTabIndex ?? "none");
        }
        element.setAttribute("tabindex", "-1");
      });
      return;
    }

    elements.forEach((element) => {
      const previousTabIndex = element.getAttribute("data-prev-tabindex");
      if (previousTabIndex === null) return;

      if (previousTabIndex === "none") {
        element.removeAttribute("tabindex");
      } else {
        element.setAttribute("tabindex", previousTabIndex);
      }

      element.removeAttribute("data-prev-tabindex");
    });
  }, [isAuthenticated, reviews, loading, error]);

  const handleLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  };

  const reviewListContent = (
    <>
      {loading && <ReviewListSkeleton />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && reviews.length === 0 && (
        <EmptyStateCard message="There are no reviews for this company yet." />
      )}
      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <ReviewItemCard
              key={review.reviewId ?? review.id ?? idx}
              review={review}
              companySlug={companySlug}
            />
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      <h2 className="font-plus-jakarta text-2xl font-bold tracking-[-0.02em] text-slate-900">All Reviews</h2>
      <TwoColumnLayout
        leftClassName="space-y-4"
        left={(
          <div className="relative min-h-[260px]">
            <div
              ref={lockedContainerRef}
              className={!isAuthenticated ? "pointer-events-none select-none blur-[2px]" : ""}
              aria-hidden={!isAuthenticated}
              inert={!isAuthenticated ? "" : undefined}
            >
              {reviewListContent}
            </div>

            {!isAuthenticated && (
              <div className="absolute inset-0 z-10 rounded-2xl bg-slate-100/35 backdrop-blur-[1px]">
                <div className="sticky top-8 mx-auto w-full max-w-[360px] px-4">
                  <div className="rounded-2xl border border-orange-100 bg-white p-6 text-center shadow-xl">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100/60">
                      <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="font-plus-jakarta text-2xl font-bold text-slate-900">Locked Content</h3>
                    <p className="mt-2 font-inter text-sm text-slate-600">
                      Log in to your account to view full testimonials and detailed ratings from internship alumni.
                    </p>
                    <button
                      onClick={handleLogin}
                      type="button"
                      className="mt-5 h-11 w-full rounded-xl bg-orange-500 px-4 font-plus-jakarta text-lg font-semibold text-white transition-colors hover:bg-orange-600"
                    >
                      Log In
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        right={
          <>
            {summaryData?.ratings && <ReviewRatingsCard data={summaryData.ratings} />}
            <CompanyInternedCTACard companySlug={companySlug} companyName={companyName} />
          </>
        }
      />
    </div>
  );
};
