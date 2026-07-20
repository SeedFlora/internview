import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { BackButton } from "@/components/common/BackButton";
import { ReviewItemCard } from "@/features/companies/components/cards/ReviewItemCard";
import { getCompanyReviewDetail, getCompanyReviews } from "@/api/reviewApi";
import { getCompanyBySlug } from "@/api/companyApi";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import {
  getAuthorDisplayName,
  getCompanyDisplayName,
  getJobTitleDisplay,
  humanizeSlug,
} from "../utils/reviewDisplayUtils";
import { collectReviewIdentifiers, getReviewIdentifier } from "../utils/reviewIdUtils";

const computeOverallRating = (review) => {
  if (typeof review?.averageRating === "number") return review.averageRating;

  const ratings = review?.ratings ?? {};
  const values = Object.values(ratings).filter((value) => typeof value === "number");
  if (!values.length) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const getTestimony = (item) =>
  item?.testimony?.trim?.() || item?.review?.trim?.() || item?.content?.trim?.();

const toItems = (data) => (Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
const toReview = (data) =>
  data?.review ?? data?.item ?? data?.detail ?? data?.internshipDetail ?? data ?? null;

const MoreReviewCard = ({ review, companySlug }) => {
  const reviewId = getReviewIdentifier(review);
  const authorName = getAuthorDisplayName(review);
  const jobTitle = getJobTitleDisplay(review);
  const overallRating = computeOverallRating(review);
  const testimony = getTestimony(review);

  if (!reviewId) return null;

  return (
    <Link
      to={`/company/${companySlug}/review/${reviewId}`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(
              authorName
            )}`}
          >
            {getInitials(authorName)}
          </div>
          <div>
            <p className="font-plus-jakarta text-sm font-semibold text-slate-900">{authorName}</p>
            <p className="font-inter text-xs text-slate-500">{jobTitle}</p>
          </div>
        </div>

        {typeof overallRating === "number" ? (
          <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1">
            <svg className="h-3.5 w-3.5 fill-orange-500 text-orange-500" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-inter text-sm font-semibold text-orange-600">{overallRating.toFixed(1)}</span>
          </div>
        ) : null}
      </div>

      <p className="font-inter line-clamp-3 text-sm leading-relaxed text-slate-700">
        {testimony ? `"${testimony}"` : "Review belum memiliki testimony."}
      </p>
    </Link>
  );
};

export const ReviewDetailPage = () => {
  const { companySlug, reviewId } = useParams();
  const [review, setReview] = useState(null);
  const [companyReviews, setCompanyReviews] = useState([]);
  const [companyNameFromSlug, setCompanyNameFromSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companySlug) return;

    let isMounted = true;

    const fetchCompanyName = async () => {
      try {
        const response = await getCompanyBySlug(companySlug);
        const { success, data } = handleApiResponse(response);
        if (!success || !isMounted) return;

        const companyName =
          data?.companyName ?? data?.name ?? data?.company?.companyName ?? "";
        if (companyName) {
          setCompanyNameFromSlug(companyName);
        }
      } catch {
        // Keep fallback from slug formatting when company API fails.
      }
    };

    fetchCompanyName();
    return () => {
      isMounted = false;
    };
  }, [companySlug]);

  useEffect(() => {
    if (!reviewId) return;

    const fetchReview = async () => {
      setLoading(true);
      setError(null);

      try {
        const [reviewResponse, listResponse] = await Promise.all([
          getCompanyReviewDetail(companySlug, reviewId),
          getCompanyReviews(companySlug, { limit: 15 }),
        ]);

        const { success: detailSuccess, message: detailMessage, data: detailData } =
          handleApiResponse(reviewResponse);
        const { success: listSuccess, data: listData } = handleApiResponse(listResponse);

        if (!detailSuccess) {
          setError(detailMessage || "Gagal memuat detail review");
          return;
        }

        const detailReview = toReview(detailData);
        const list = listSuccess ? toItems(listData) : [];
        const fallbackReview = list.find((item) =>
          collectReviewIdentifiers(item).includes(String(reviewId))
        );

        setReview(detailReview ?? fallbackReview ?? null);
        setCompanyReviews(list);
      } catch (err) {
        setError(normalizeErrorMessage(err, "Gagal memuat detail review"));
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [companySlug, reviewId]);

  const companyName = useMemo(() => {
    const fromReview = getCompanyDisplayName(review);
    if (fromReview && fromReview !== "Perusahaan") return fromReview;
    if (companyNameFromSlug) return companyNameFromSlug;
    return humanizeSlug(companySlug) || "Perusahaan";
  }, [review, companyNameFromSlug, companySlug]);

  const moreReviews = useMemo(() => {
    if (!review) return [];

    const activeId = String(getReviewIdentifier(review));
    return companyReviews
      .filter((item) => String(getReviewIdentifier(item)) !== activeId)
      .filter((item) => Boolean(getReviewIdentifier(item)))
      .slice(0, 2);
  }, [companyReviews, review]);

  const activeAuthor = useMemo(() => getAuthorDisplayName(review), [review]);

  const moreReviewsByAuthor = useMemo(() => {
    if (!review) return [];

    const activeId = String(getReviewIdentifier(review));
    const normalizedAuthor = activeAuthor.toLowerCase().trim();

    return companyReviews
      .filter((item) => String(getReviewIdentifier(item)) !== activeId)
      .filter((item) => getAuthorDisplayName(item).toLowerCase().trim() === normalizedAuthor)
      .slice(0, 2);
  }, [companyReviews, review, activeAuthor]);

  return (
    <div className="bg-slate-50/70 py-8 md:py-10">
      <Container className="max-w-5xl">
        <div className="mb-4">
          <BackButton variant="default" label="Back" />
        </div>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="font-plus-jakarta text-xl font-bold text-slate-900 md:text-2xl">
            Review of{" "}
            <Link
              to={`/company/${companySlug}`}
              className="text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:text-orange-600"
            >
              {companyName}
            </Link>
          </h1>
        </div>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        )}

        {!loading && error && <ErrorMessage message={error} />}
        {!loading && !error && !review && (
          <ErrorMessage message="Review tidak ditemukan." />
        )}

        {!loading && !error && review && (
          <>
            <ReviewItemCard review={review} companySlug={companySlug} interactive={false} />

            {moreReviewsByAuthor.length > 0 && (
              <section className="mt-8 space-y-4">
                <h2 className="font-plus-jakarta text-xl font-bold text-slate-900 md:text-2xl">
                  More Reviews by {activeAuthor}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {moreReviewsByAuthor.map((item, index) => (
                    <MoreReviewCard
                      key={getReviewIdentifier(item) ?? index}
                      review={item}
                      companySlug={companySlug}
                    />
                  ))}
                </div>
              </section>
            )}

            {moreReviewsByAuthor.length === 0 && moreReviews.length > 0 && (
              <section className="mt-8 space-y-4">
                <h2 className="font-plus-jakarta text-xl font-bold text-slate-900 md:text-2xl">
                  More Reviews from {companyName}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {moreReviews.map((item, index) => (
                    <MoreReviewCard
                      key={getReviewIdentifier(item) ?? index}
                      review={item}
                      companySlug={companySlug}
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
