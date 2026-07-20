import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { BackButton } from "@/components/common/BackButton";
import { getCompanyReviews, getRecentReviews } from "@/api/reviewApi";
import { getCompanies } from "@/api/companyApi";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";
import { ReviewItemCard } from "@/features/companies/components/cards/ReviewItemCard";
import { getHost, normalizeText, slugify } from "../utils/reviewTextUtils";

const toItems = (data) => (Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);

const getTimestamp = (item) => new Date(item?.createdAt).getTime();
const sortByNewest = (a, b) => getTimestamp(b) - getTimestamp(a);

const enrichReviews = (list, companyByName, companyByHost) =>
  list.map((review) => {
    const directSlug = review?.companySlug;

    const host = getHost(review?.companyWebsite);
    const byName = normalizeText(review?.companyName);

    const resolvedCompanySlug =
      directSlug ||
      (host ? companyByHost.get(host) : null) ||
      (byName ? companyByName.get(byName) : null) ||
      slugify(review.companyName);

    const reviewerName = review.createdByName;

    return {
      ...review,
      resolvedReviewId: review?.internshipHeaderId,
      resolvedCompanySlug,
      resolvedReviewerName: reviewerName,
      resolvedReviewerSlug: slugify(reviewerName),
    };
  });

const DetailSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-24 rounded-xl" />
    <Skeleton className="h-80 rounded-xl" />
  </div>
);

const toReviewItemPayload = (item) => ({
  ...item,
  createdByName: item?.createdByName ?? item?.createdBy ?? item?.resolvedReviewerName,
  internshipDetailId: item?.internshipDetailId ?? item?.reviewId ?? item?.resolvedReviewId,
  internshipHeaderId: item?.internshipHeaderId,
  reviewId: item?.reviewId ?? item?.resolvedReviewId,
  id: item?.id ?? item?.resolvedReviewId,
  detailId: item?.detailId ?? item?.resolvedReviewId,
});

export const ReviewerReviewsDetailPage = () => {
  const { reviewerSlug, reviewId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reviewId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [reviewsResponse, companiesResponse] = await Promise.all([
          getRecentReviews(),
          getCompanies(),
        ]);

        const parsedReviews = handleApiResponse(reviewsResponse);
        if (!parsedReviews.success) {
          setError(parsedReviews.message || "Failed to load reviewer data.");
          return;
        }

        const rawItems = toItems(parsedReviews.data);

        const companies = Array.isArray(companiesResponse?.result) ? companiesResponse.result : [];
        const companyByName = new Map();
        const companyByHost = new Map();

        companies.forEach((company) => {
          const slug = company?.companySlug || company?.slug;
          if (!slug) return;

          const normalizedName = normalizeText(company?.companyName);
          if (normalizedName) companyByName.set(normalizedName, slug);

          const host = getHost(company?.website);
          if (host) companyByHost.set(host, slug);
        });

        const enriched = enrichReviews(rawItems, companyByName, companyByHost).sort(sortByNewest);
        const companySlugs = Array.from(
          new Set(enriched.map((item) => item?.resolvedCompanySlug).filter(Boolean))
        );

        const detailMap = new Map();

        await Promise.all(
          companySlugs.map(async (slug) => {
            try {
              const companyReviewsResponse = await getCompanyReviews(slug, { limit: 15 });
              const parsedCompanyReviews = handleApiResponse(companyReviewsResponse);

              if (!parsedCompanyReviews.success) return;

              const items = toItems(parsedCompanyReviews.data);

              items.forEach((reviewItem) => {
                const ids = reviewItem?.internshipHeaderId;
                if (!ids.length) return;
                ids.forEach((id) => {
                  detailMap.set(`${slug}::${id}`, reviewItem);
                });
              });
            } catch {
              // Keep partial data when one company detail call fails.
            }
          })
        );

        const hydrated = enriched.map((item) => {
          const ids = item?.internshipHeaderId;
          if (item?.resolvedReviewId) {
            ids.push(String(item.resolvedReviewId));
          }

          const detailed = ids
            .map((id) => detailMap.get(`${item?.resolvedCompanySlug}::${id}`))
            .find(Boolean);

          if (!detailed) return item;

          return {
            ...item,
            ...detailed,
            resolvedCompanySlug: item?.resolvedCompanySlug,
            resolvedReviewId: item?.resolvedReviewId,
            resolvedReviewerName: item?.resolvedReviewerName,
            resolvedReviewerSlug: item?.resolvedReviewerSlug,
          };
        });

        setReviews(hydrated);
      } catch (err) {
        setError(normalizeErrorMessage(err, "Failed to load reviewer data."));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reviewId]);

  const selectedReview = useMemo(() => {
    const sortedReviews = [...reviews].sort(sortByNewest);

    const sameReviewer = sortedReviews
      .filter((item) => item?.resolvedReviewerSlug === reviewerSlug)
      .sort(sortByNewest);

    if (String(reviewId) === "latest") {
      return sameReviewer[0] ?? sortedReviews[0] ?? null;
    }

    const matchedBySlugAndId = sameReviewer.find((item) =>
      String(item?.resolvedReviewId) === String(reviewId)
    );

    if (matchedBySlugAndId) return matchedBySlugAndId;

    const matchedByIdOnly = sortedReviews.find((item) =>
      String(item?.resolvedReviewId) === String(reviewId)
    );

    if (matchedByIdOnly) return matchedByIdOnly;

    return sameReviewer[0] ?? sortedReviews[0] ?? null;
  }, [reviews, reviewId, reviewerSlug]);

  const activeReviewerSlug = useMemo(() => {
    if (selectedReview?.resolvedReviewerSlug) return selectedReview.resolvedReviewerSlug;
    const firstSlug = reviews.find((item) => item?.resolvedReviewerSlug)?.resolvedReviewerSlug;
    return reviewerSlug || firstSlug || "unknown-reviewer";
  }, [selectedReview, reviewerSlug, reviews]);

  const reviewerName = useMemo(() => {
    if (selectedReview?.resolvedReviewerName) return selectedReview.resolvedReviewerName;

    const found = reviews.find((item) => item?.resolvedReviewerSlug === activeReviewerSlug);
    return found?.resolvedReviewerName || reviews[0]?.resolvedReviewerName || "Reviewer";
  }, [selectedReview, reviews, activeReviewerSlug]);

  const moreReviews = useMemo(() => {
    if (!selectedReview) return [];

    const selectedSlug = selectedReview?.resolvedReviewerSlug;
    const selectedName = String(selectedReview?.resolvedReviewerName || "").toLowerCase().trim();

    return reviews
      .filter((item) => {
        if (selectedSlug && item?.resolvedReviewerSlug) {
          return item.resolvedReviewerSlug === selectedSlug;
        }

        return String(item?.resolvedReviewerName || "").toLowerCase().trim() === selectedName;
      })
      .filter((item) => String(item?.resolvedReviewId) !== String(selectedReview?.resolvedReviewId))
      .sort(sortByNewest)
      .slice(0, 2);
  }, [reviews, selectedReview]);

  return (
    <div className="bg-slate-50/70 py-8 md:py-10">
      <Container className="max-w-5xl">
        <div className="mb-4">
          <BackButton variant="default" label="Back" />
        </div>

        <div className="mb-5">
          <h1 className="font-plus-jakarta text-xl font-bold text-slate-900 md:text-2xl">
            Reviews by {reviewerName}
          </h1>
        </div>

        {loading && <DetailSkeleton />}
        {!loading && error && <ErrorMessage message={error} />}
        {!loading && !error && !selectedReview && (
          <ErrorMessage message="Reviewer data was not found." />
        )}

        {!loading && !error && selectedReview && (
          <>
            <ReviewItemCard
              review={toReviewItemPayload(selectedReview)}
              companySlug={selectedReview?.resolvedCompanySlug}
              interactive={false}
              hideRatings={true}
              hideHelpful={true}
            />

            {moreReviews.length > 0 && (
              <section className="mt-8 space-y-4">
                <h2 className="font-plus-jakarta text-xl font-bold text-slate-900 md:text-2xl">
                  More Reviews from {reviewerName}
                </h2>
                <div className="space-y-4">
                  {moreReviews.map((item, index) => (
                    <ReviewItemCard
                      key={item?.resolvedReviewId ?? index}
                      review={toReviewItemPayload(item)}
                      companySlug={item?.resolvedCompanySlug}
                      interactive={false}
                      hideRatings={true}
                      hideHelpful={true}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </Container>
    </div>
  );
};
