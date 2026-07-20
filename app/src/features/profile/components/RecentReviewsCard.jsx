import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkeletonLine } from "@/components/ui/skeleton";

const getReviewText = (review) => review?.testimony

const getCompanyName = (review) => review.companyName

const getJobTitle = (review) => review?.jobTitle

const normalizeRoutePath = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const getReviewPageUrl = (review) => normalizeRoutePath(review?.reviewUrl);

const getRecruitmentPageUrl = (review) => normalizeRoutePath(review?.recruitmentUrl);

export const RecentReviewsCard = ({
  reviews,
  loading,
  error,
  unavailable = false,
}) => {
  return (
    <Card className="rounded-2xl border border-slate-200">
      <CardHeader className="space-y-1 pb-2">
        <h2 className="font-plus-jakarta text-xl font-bold text-slate-900">
          Review ({reviews.length})
        </h2>
        <p className="font-inter text-sm text-slate-500">Your review history</p>
      </CardHeader>

      <CardContent className="pt-2">
        {loading && (
          <div className="space-y-2.5">
            <SkeletonLine height="h-16" />
            <SkeletonLine height="h-16" />
          </div>
        )}

        {!loading && error && (
          <p className="font-inter text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && unavailable && (
          <p className="font-inter text-sm text-slate-500">
            Recent Reviews feature is still in development. Stay tuned for updates!
          </p>
        )}

        {!loading && !error && !unavailable && reviews.length === 0 && (
          <p className="font-inter text-sm text-slate-500">No reviews submitted yet.</p>
        )}

        {!loading && !error && !unavailable && reviews.length > 0 && (
          <div className="space-y-3">
            {reviews.map((review, index) => {
              const reviewPageUrl = getReviewPageUrl(review);
              const recruitmentPageUrl = getRecruitmentPageUrl(review);
              return (
                <div key={index} className="rounded-xl border border-slate-200 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-plus-jakarta text-base font-semibold text-slate-900">
                        {getCompanyName(review)}
                      </p>
                      <p className="font-inter text-sm text-slate-500">{getJobTitle(review)}</p>
                    </div>
                  </div>

                  <p className="font-inter mt-1.5 line-clamp-2 text-sm text-slate-700">
                    "{getReviewText(review)}"
                  </p>

                  <div className="mt-2 flex items-center gap-4">
                    {reviewPageUrl ? (
                      <Link
                        to={reviewPageUrl}
                        className="font-inter inline-block text-xs font-semibold text-orange-600 hover:text-orange-700"
                      >
                        Open review page
                      </Link>
                    ) : null}

                    {recruitmentPageUrl ? (
                      <Link
                        to={recruitmentPageUrl}
                        className="font-inter inline-block text-xs font-semibold text-orange-600 hover:text-orange-700"
                      >
                        Open recruitment page
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
