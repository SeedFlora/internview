import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { getRecentReviews } from '@/api/reviewApi';
import { RecentReviewCard } from '@/features/reviews/components/RecentReviewCard';

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getReviewerName = (review) => review?.createdBy ?? 'Anonim';

export function HighlightReview() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const recentResponse = await getRecentReviews();

        if (!recentResponse?.success) {
          setReviews([]);
          return;
        }

        const items = Array.isArray(recentResponse?.result?.items)
          ? recentResponse.result.items
          : Array.isArray(recentResponse?.result)
          ? recentResponse.result
          : [];

        const enriched = items.map((review) => ({
          ...review,
          resolvedReviewerSlug: slugify(getReviewerName(review)),
        }));

        setReviews(enriched);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

  return (
    <section className="bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-plus-jakarta mb-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Recent Reviews
            </h2>
            <p className="font-inter text-sm text-slate-500">
              Cerita nyata dari mereka yang telah magang
            </p>
          </div>

          <Link
            to="/reviews"
            className="font-inter flex items-center gap-1 text-sm font-semibold text-[#F97316] transition hover:opacity-80"
          >
            Read more reviews <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="hide-scrollbar overflow-x-auto pb-2">
          <div className="flex min-w-max snap-x snap-mandatory items-start gap-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[320px] shrink-0 rounded-xl sm:w-[340px]"
                  >
                    <Skeleton className="h-[210px] rounded-xl" />
                  </div>
                ))
              : reviews.map((review, i) => (
                  <RecentReviewCard
                    key={
                      review.reviewId ?? i
                    }
                    {...review}
                    reviewerSlug={review.resolvedReviewerSlug}
                    className="w-[320px] shrink-0 snap-start px-5 pt-5 pb-4 sm:w-[340px]"
                  />
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}