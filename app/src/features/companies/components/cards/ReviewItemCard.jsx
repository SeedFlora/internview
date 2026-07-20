import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BadgeCheck, Share2, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { getCompanyReviews, likeReview, unlikeReview } from "@/api/reviewApi";
import { UnauthenticatedModal } from "@/components/common/UnauthenticatedModal";
import { StarRating } from "@/components/ui/StarRating";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";
import { useAuth } from "@/hooks/useAuth";
import { getInitials, getAvatarColor } from "@/utils/avatar";

const RATING_ROWS = [
  [
    { key: "workCulture", label: "Budaya Kerja" },
    { key: "learningOpp", label: "Kesempatan Belajar" },
  ],
  [
    { key: "mentorship", label: "Mentorship" },
    { key: "benefit", label: "Benefit" },
  ],
  [{ key: "workLifeBalance", label: "Work-Life Balance" }],
];

const computeOverallRating = (ratings = {}) => {
  const values = Object.values(ratings)
    .map((value) => {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    })
    .filter((v) => typeof v === "number");
  if (!values.length) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

const formatDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const SectionLabel = ({ children }) => (
  <p className="mb-1 font-inter text-xs font-semibold uppercase tracking-wide text-gray-500">
    {children}
  </p>
);

const InfoBadge = ({ children }) => (
  <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 font-inter text-xs text-gray-700">
    {children}
  </span>
);

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const resolveCompanyName = (review) =>review?.companyName ?? "Company";

const resolveReviewerSlug = (review, displayName) =>
  review?.resolvedReviewerSlug ?? review?.reviewerSlug ?? slugify(displayName);

const resolveCompanySlug = (companySlug, review) =>
  companySlug ?? slugify(resolveCompanyName(review));

const resolveReviewDetailId = (review) => review?.internshipDetailId;

const resolveInternshipHeaderId = (review) => review?.internshipHeaderId;

const resolveLikeCount = (item) => {
  const raw = item?.totalLikes;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolveLikedState = (item) => {
  if (typeof item?.isLiked === "boolean") return item.isLiked;
  if (typeof item?.liked === "boolean") return item.liked;
  return null;
};

export const ReviewItemCard = ({
  review,
  companySlug,
  interactive = true,
  hideRatings = false,
  hideHelpful = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(Boolean(review?.isLiked));
  const [likeLoading, setLikeLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [likeCount, setLikeCount] = useState(
    review?.totalLikes ?? review?.likeCount ?? review?.helpfulCount ?? review?.helpful ?? 0
  );

  const ratings = review?.ratings ?? {
    workCulture: review?.workCulture ?? 0,
    learningOpp: review?.learningOpp ??  0,
    mentorship: review?.mentorship ?? 0,
    benefit: review?.benefit ?? 0,
    workLifeBalance: review?.workLifeBalance ?? 0,
  };

  const normalizeRating = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const displayName = review?.createdByName ?? "Anonymous";

  const jobTitle = review?.jobTitle ?? review?.role ?? review?.position ?? "-";
  const resolvedCompanySlug = resolveCompanySlug(companySlug, review);
  const durationMonths = review?.durationMonths;
  const year = review?.year;
  const type = review?.type;
  const workScheme = review?.workScheme;
  const subCategories =
    review?.subCategories ?? review?.subCategoryNames ?? review?.subcategories ?? [];
  const testimony = review?.testimony ?? review?.review ?? review?.content;
  const pros = review?.pros;
  const cons = review?.cons;
  const createdAt = review?.createdAt;
  const resolvedReviewerSlug = resolveReviewerSlug(review, displayName);
  const verifiedReviewer = review?.verifiedReviewer === true;

  const overallRating =
    typeof review?.averageRating === "number"
      ? review.averageRating
      : computeOverallRating(ratings);
  const reviewDetailId = resolveReviewDetailId(review);
  const internshipHeaderId = resolveInternshipHeaderId(review);

  useEffect(() => {
    setLiked(Boolean(review?.isLiked));
    setLikeCount(review?.totalLikes ?? 0);
  }, [review]);

  const handleShare = async () => {
    const reviewPath = reviewDetailId && resolvedCompanySlug
      ? `/company/${resolvedCompanySlug}/review/${reviewDetailId}`
      : resolvedReviewerSlug
        ? `/reviews/user/${resolvedReviewerSlug}/${reviewDetailId ?? "latest"}`
        : null;

    if (!reviewPath) {
      toast.error("The review link cannot be generated because the data is incomplete.");
      return;
    }

    try {
      const shareUrl = `${window.location.origin}${reviewPath}`;

      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast.success("Review link copied successfully.");
    } catch {
      setCopied(false);
      toast.error("Failed to copy the review link.");
    }
  };

  const handleOpenDetail = () => {
    if (!interactive) return;

    if (!reviewDetailId) {
      toast.error("Review ID was not found.");
      return;
    }
    if (!resolvedCompanySlug) {
      toast.error("Company slug was not found.");
      return;
    }

    navigate(`/company/${resolvedCompanySlug}/review/${reviewDetailId}`);
  };

  const handleLikeClick = async () => {
    if (likeLoading) return;

    if (!internshipHeaderId) {
      toast.error("Review header ID was not found.");
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const previousLiked = liked;
    const previousCount = likeCount;
    const nextLiked = !previousLiked;
    const nextCount = Math.max(0, previousCount + (nextLiked ? 1 : -1));

    setLiked(nextLiked);
    setLikeCount(nextCount);
    setLikeLoading(true);

    try {
      const response = nextLiked
        ? await likeReview(internshipHeaderId)
        : await unlikeReview(internshipHeaderId);
      const { success, message, data } = handleApiResponse(response);

      if (!success) {
        setLiked(previousLiked);
        setLikeCount(previousCount);
        toast.error(message || "Failed to update the review like.");
        return;
      }

      const serverCount = resolveLikeCount(data);
      if (serverCount !== null) {
        setLikeCount(serverCount);
      }

      const serverLiked = resolveLikedState(data);
      if (serverLiked !== null) {
        setLiked(serverLiked);
      }

      if (resolvedCompanySlug) {
        const latestResponse = await getCompanyReviews(resolvedCompanySlug, { limit: 15 });
        const { success: latestSuccess, data: latestData } = handleApiResponse(latestResponse);

        if (latestSuccess) {
          const latestItems = Array.isArray(latestData?.items)
            ? latestData.items
            : Array.isArray(latestData)
            ? latestData
            : [];

          const latestReview = latestItems.find((item) => {
            const itemHeaderId = resolveInternshipHeaderId(item);
            const itemDetailId = resolveReviewDetailId(item);

            if (itemHeaderId && internshipHeaderId) {
              return String(itemHeaderId) === String(internshipHeaderId);
            }

            if (itemDetailId && reviewDetailId) {
              return String(itemDetailId) === String(reviewDetailId);
            }

            return false;
          });

          if (latestReview) {
            const latestCount = resolveLikeCount(latestReview);
            const latestLiked = resolveLikedState(latestReview);

            if (latestCount !== null) {
              setLikeCount(latestCount);
            }

            if (latestLiked !== null) {
              setLiked(latestLiked);
            }
          }
        }
      }
    } catch (error) {
      setLiked(previousLiked);
      setLikeCount(previousCount);
      toast.error(normalizeErrorMessage(error, "Failed to update the review like."));
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div
      onClick={interactive ? handleOpenDetail : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(event) => {
        if (!interactive) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenDetail();
        }
      }}
      className={`space-y-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition md:p-5 ${
        interactive ? "cursor-pointer hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${getAvatarColor(displayName)}`}
          >
            {getInitials(displayName)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="font-plus-jakarta text-[18px] font-semibold tracking-[-0.02em] text-slate-900 md:text-[19px]">{displayName}</p>
              {verifiedReviewer && (
                <BadgeCheck className="h-5 w-5 shrink-0 text-blue-500" aria-label="Verified reviewer" />
              )}
            </div>
            <p className="font-inter text-sm text-slate-600">{jobTitle ?? "-"}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {durationMonths && (
                <InfoBadge>{durationMonths} months</InfoBadge>
              )}
              {year && <InfoBadge>{year}</InfoBadge>}
              {type && <InfoBadge>{type}</InfoBadge>}
              {workScheme && <InfoBadge>{workScheme}</InfoBadge>}
            </div>
          </div>
        </div>

        {overallRating != null && (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5">
            <svg className="h-3 w-3 fill-orange-500 text-orange-500" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-inter text-sm font-semibold text-orange-500 md:text-base">
              {overallRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {subCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {subCategories.map((cat) => (
            <span
              key={cat}
              className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 font-inter text-[11px] text-orange-700"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {!hideRatings && (
        <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
          {RATING_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-1">
              {row.map(({ key, label }) => (
                <div key={key} className="flex min-w-0 items-center justify-between gap-2">
                  <span className="font-inter text-[14px] text-slate-600 sm:text-[15px]">{label}</span>
                  <div className="shrink-0">
                    <StarRating rating={normalizeRating(ratings[key])} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {testimony && <p className="font-inter text-[15px] leading-relaxed text-slate-800">"{testimony}"</p>}

      {(pros || cons) && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {pros && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 md:p-4">
              <SectionLabel>Kelebihan (Pros)</SectionLabel>
              <p className="font-inter text-sm leading-relaxed text-emerald-800">{pros}</p>
            </div>
          )}
          {cons && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 md:p-4">
              <SectionLabel>Kekurangan (Cons)</SectionLabel>
              <p className="font-inter text-sm leading-relaxed text-rose-800">{cons}</p>
            </div>
          )}
        </div>
      )}

      <div className={`flex items-center border-t border-slate-200 pt-3 ${hideHelpful ? "justify-end" : "justify-between"}`}>
        {!hideHelpful && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleLikeClick();
            }}
            disabled={likeLoading}
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 font-inter text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
              liked
                ? "border-orange-200 bg-orange-50 text-orange-600"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            type="button"
          >
            <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {likeLoading ? "Saving..." : `Helpful (${likeCount})`}
          </button>
        )}

        <div className="flex items-center gap-2">
          {createdAt && (
            <p className="font-inter text-sm text-slate-400">{formatDate(createdAt)}</p>
          )}
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            onClick={(event) => {
              event.stopPropagation();
              handleShare();
            }}
            type="button"
            title={copied ? "Copied" : "Share"}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {showAuthModal && (
        <UnauthenticatedModal
          redirectPath={location.pathname}
          onClose={() => setShowAuthModal(false)}
          message="You need to log in first to continue this action."
        />
      )}
    </div>
  );
};
