import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UnauthenticatedModal } from "@/components/common/UnauthenticatedModal";
import { useAuth } from "@/hooks/useAuth";
import { getCompanyRecruitmentProcess, likeReview, unlikeReview } from "@/api/reviewApi";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";
import {
  CircleCheckBig,
  Clock,
  Frown,
  Globe,
  Lightbulb,
  Meh,
  MessageCircle,
  OctagonAlert,
  Share2,
  Smile,
  ThumbsUp,
} from "lucide-react";

const AVATAR_COLORS = [
  "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500",
  "bg-teal-500", "bg-blue-500", "bg-indigo-500", "bg-purple-500",
];

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const DIFFICULTY_MAP = {
  1: { label: "Very Easy", Icon: CircleCheckBig, className: "bg-green-50 text-green-700 border-green-200" },
  2: { label: "Easy", Icon: Smile, className: "bg-green-50 text-green-700 border-green-200" },
  3: { label: "Moderate", Icon: Meh, className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  4: { label: "Hard", Icon: Frown, className: "bg-orange-50 text-orange-700 border-orange-200" },
  5: { label: "Very Hard", Icon: OctagonAlert, className: "bg-red-50 text-red-700 border-red-200" },
};

const resolveLikeCount = (item) => {
  const raw =
    item?.totalLikes 

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolveLikedState = (item) => {
  if (typeof item?.isLiked === "boolean") return item.isLiked;
  if (typeof item?.liked === "boolean") return item.liked;
  return null;
};

export const RecruitmentProcessCard = ({ data, companySlug }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(Boolean(data?.isLiked));
  const [likeLoading, setLikeLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [likeCount, setLikeCount] = useState(
    data?.totalLikes ?? 0
  );

  const {
    jobTitle,
    durationMonths,
    admissionTrack,
    recruitmentDuration,
    interviewDifficulty,
    recruitmentSteps = [],
    selectionProcess,
    exampleQuestions,
    tipsTricks,
    createdByName,
  } = data;

  const displayName = createdByName ?? "Anonymous";
  const difficulty = DIFFICULTY_MAP[interviewDifficulty];
  const processDetailId = data?.internshipDetailId;
  const internshipHeaderId = data?.internshipHeaderId;

  useEffect(() => {
    setLiked(Boolean(data?.isLiked));
    setLikeCount(data?.totalLikes ?? 0);
  }, [data]);

  const handleShare = async () => {
    if (!processDetailId || !companySlug) {
      toast.error("The recruitment process link cannot be created because the data is incomplete.");
      return;
    }

    try {
      const processPath = `/company/${companySlug}/recruitment/${processDetailId}`;
      const shareUrl = `${window.location.origin}${processPath}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast.success("Recruitment process link copied successfully.");
    } catch {
      setCopied(false);
      toast.error("Failed to copy the recruitment process link.");
    }
  };

  const handleOpenDetail = () => {
    if (!processDetailId) {
      toast.error("Recruitment process ID was not found.");
      return;
    }
    if (!companySlug) {
      toast.error("Company slug was not found.");
      return;
    }

    navigate(`/company/${companySlug}/recruitment/${processDetailId}`);
  };

  const handleLikeClick = async () => {
    if (likeLoading) return;

    if (!internshipHeaderId) {
      toast.error("Recruitment process header ID was not found.");
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
      const { success, message, data: result } = handleApiResponse(response);

      if (!success) {
        setLiked(previousLiked);
        setLikeCount(previousCount);
        toast.error(message || "Failed to update the recruitment process like.");
        return;
      }

      const serverCount = resolveLikeCount(result);
      if (serverCount !== null) {
        setLikeCount(serverCount);
      }

      const serverLiked = resolveLikedState(result);
      if (serverLiked !== null) {
        setLiked(serverLiked);
      }

      // Sync from latest server list so counter/value remain stable after refresh.
      if (companySlug) {
        const latestResponse = await getCompanyRecruitmentProcess(companySlug, { limit: 15 });
        const { success: latestSuccess, data: latestData } = handleApiResponse(latestResponse);

        if (latestSuccess) {
          const latestItems = Array.isArray(latestData?.items)
            ? latestData.items
            : Array.isArray(latestData)
            ? latestData
            : [];

          const latestItem = latestItems.find((item) => {
            const itemHeaderId = item?.internshipHeaderId;
            const itemDetailId = item?.internshipDetailId;

            if (itemHeaderId && internshipHeaderId) {
              return String(itemHeaderId) === String(internshipHeaderId);
            }

            if (itemDetailId && processDetailId) {
              return String(itemDetailId) === String(processDetailId);
            }

            return false;
          });

          if (latestItem) {
            const latestCount = resolveLikeCount(latestItem);
            const latestLiked = resolveLikedState(latestItem);

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
      toast.error(
        normalizeErrorMessage(error, "Failed to update the recruitment process like.")
      );
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div
      onClick={handleOpenDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenDetail();
        }
      }}
      className="space-y-3.5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md md:p-5"
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(displayName)}`}
        >
          {getInitials(displayName)}
        </div>
        <div>
          <p className="font-plus-jakarta text-[19px] font-semibold text-slate-900 md:text-[20px]">{displayName}</p>
          <p className="font-inter text-sm text-slate-600">{jobTitle}</p>
          {durationMonths && (
            <p className="font-inter text-xs text-slate-400">Internship duration: {durationMonths} months</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {admissionTrack && (
            <span className="inline-flex max-w-full items-center gap-1 rounded-lg border border-sky-200 bg-sky-100/70 px-2.5 py-1 font-inter text-sm font-semibold text-sky-700">
            <Globe className="h-3.5 w-3.5 shrink-0" /> {admissionTrack}
          </span>
        )}
        {difficulty && (
            <span className={`inline-flex max-w-full items-center gap-1 rounded-lg border px-2.5 py-1 font-inter text-sm font-semibold ${difficulty.className}`}>
            <difficulty.Icon className="h-3.5 w-3.5 shrink-0" /> {difficulty.label}
          </span>
        )}
        {recruitmentDuration && (
            <span className="inline-flex max-w-full items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1 font-inter text-sm font-semibold text-slate-600">
            <Clock size={12} /> {recruitmentDuration}
          </span>
        )}
      </div>

      {recruitmentSteps.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
          <p className="mb-2 font-inter text-xs font-semibold uppercase tracking-wide text-slate-500">Selection Process</p>
          <div className="flex flex-wrap gap-2">
            {recruitmentSteps.map((step, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-inter text-sm text-slate-700"
              >
                <span className="text-orange-400">○</span> {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {selectionProcess && (
        <div>
            <p className="mb-2 font-inter text-xs font-semibold uppercase tracking-wide text-slate-500">Selection Experience</p>
          <p className="whitespace-pre-line font-inter text-[15px] leading-7 text-slate-700">{selectionProcess}</p>
        </div>
      )}

      {exampleQuestions && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
          <p className="mb-2 flex items-center gap-2 font-inter text-xs font-semibold uppercase tracking-wide text-slate-500">
            <MessageCircle size={13} /> Interview Questions
          </p>
          <p className="whitespace-pre-line font-inter text-[15px] leading-7 text-slate-700">{exampleQuestions}</p>
        </div>
      )}

      {tipsTricks && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5">
          <p className="mb-2 flex items-center gap-2 font-inter text-xs font-semibold uppercase tracking-wide text-amber-700">
            <Lightbulb size={13} /> Tips to Succeed
          </p>
          <p className="whitespace-pre-line font-inter text-[15px] leading-7 text-amber-800">{tipsTricks}</p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 pt-2.5">
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
        <div className="flex items-center gap-2">
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
