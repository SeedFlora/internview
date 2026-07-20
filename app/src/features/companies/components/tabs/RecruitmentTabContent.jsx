import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useAuth } from "@/hooks/useAuth";
import { TwoColumnLayout } from "@/components/layout";
import { RecruitmentProcessCard } from "../cards/RecruitmentProcessCard";
import { AverageDifficultyCard } from "../cards/AverageDifficultyCard";
import { RecruitmentStatisticsCard } from "../cards/RecruitmentStatisticsCard";
import { CompanyInternedCTACard } from "../cards/CompanyInternedCTACard";
import { EmptyStateCard } from "../cards/EmptyStateCard";
import { useCompanyRecruitmentProcess } from "../../hooks/useCompanyRecruitmentProcess";
import { useRecruitmentProcessSummary } from "../../hooks/useRecruitmentProcessSummary";

const CardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-16 rounded-xl" />
    <Skeleton className="h-20 rounded-xl" />
  </div>
);

const SidebarSkeleton = () => (
  <div className="space-y-4">
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-20 rounded-xl" />
    </div>
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-3/4 rounded-full" />
    </div>
  </div>
);

export const RecruitmentTabContent = ({ companySlug, companyName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { items, loading: listLoading, error: listError, hasMore, loadMore } = useCompanyRecruitmentProcess(companySlug);
  const { summary, loading: summaryLoading } = useRecruitmentProcessSummary(companySlug);
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
  }, [isAuthenticated, items, listLoading, listError, hasMore]);

  const handleLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  };

  const recruitmentListContent = (
    <>
      {listLoading && items.length === 0 && (
        <div className="space-y-4">
          {[1, 2].map((i) => <CardSkeleton key={i} />)}
        </div>
      )}
      {!listLoading && listError && items.length === 0 && (
        <ErrorMessage message={listError} />
      )}
      {!listLoading && !listError && items.length === 0 && (
        <EmptyStateCard message="There is no recruitment information for this company yet." />
      )}
      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <RecruitmentProcessCard
              key={item.internshipDetailId ?? item.id}
              data={item}
              companySlug={companySlug}
            />
          ))}
        </div>
      )}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={listLoading}
            className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {listLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      <h2 className="font-plus-jakarta text-2xl font-bold tracking-[-0.02em] text-slate-900">Alumni Recruitment Experience</h2>
      <TwoColumnLayout
        leftClassName="space-y-4"
        rightClassName="space-y-4"
        left={(
          <div className="relative min-h-[260px]">
            <div
              ref={lockedContainerRef}
              className={!isAuthenticated ? "pointer-events-none select-none blur-[2px]" : ""}
              aria-hidden={!isAuthenticated}
              inert={!isAuthenticated ? "" : undefined}
            >
              {recruitmentListContent}
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
                      Log in to your account to view full recruitment experiences and detailed interview process insights.
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
            {summaryLoading && !summary && <SidebarSkeleton />}
            {summary && (
              <>
                <AverageDifficultyCard difficulty={summary.difficulty} />
                <RecruitmentStatisticsCard statistics={summary.statistics} />
              </>
            )}
            <CompanyInternedCTACard companySlug={companySlug} companyName={companyName} />
          </>
        }
      />
    </div>
  );
};
