import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/StarRating";
import { CompanyLogo } from "@/components/common/CompanyLogo";
import { BackButton } from "@/components/common/BackButton";
import { UnauthenticatedModal } from "@/components/common/UnauthenticatedModal";
import { useAuth } from "@/hooks/useAuth";
import { useSaveCompany } from "../../hooks/useSaveCompany";
import { CompanySelectModal } from "../comparison/CompanySelectModal";
import { ArrowLeftRight, Bookmark, BriefcaseBusiness, Share2 } from "lucide-react";

export const CompanyGeneralInfoSection = ({
  companySlug,
  companyName,
  companyAbbreviation,
  website,
  initialIsSaved,
  isPartner,
  subcategoryName,
  rating,
  totalReviews,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isSaved, saving, toggleSave } = useSaveCompany({
    companySlug,
    initialIsSaved,
  });
  const trimmedCompanyName = typeof companyName === "string" ? companyName.trim() : "";
  const trimmedCompanyAbbreviation = typeof companyAbbreviation === "string" ? companyAbbreviation.trim() : "";
  const titleText =
    trimmedCompanyAbbreviation &&
    trimmedCompanyName &&
    trimmedCompanyAbbreviation.toLowerCase() !== trimmedCompanyName.toLowerCase()
      ? `${companyName} (${trimmedCompanyAbbreviation})`
      : companyName;

  const openAuthModal = () => {
    setShowAuthModal(true);
  };

  const handleShareClick = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    const currentUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleSaveClick = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    await toggleSave();
  };

  const handleCompareClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    setIsCompareModalOpen(true);
  };

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    navigate(`/review/${companySlug}`);
  };

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 py-10 md:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.16),transparent_34%)]" />

      <Container className="relative z-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <BackButton
            variant="ghost"
            label="Back to Companies"
            className="text-white/90 hover:bg-white/15 hover:text-white"
          />

          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:justify-end">
            <button
              onClick={handleShareClick}
              className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/70 bg-white px-4 font-inter text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              title="Copy link to clipboard"
            >
              <Share2 className="h-4 w-4" />
              {copiedUrl ? "Copied!" : "Share"}
            </button>
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className={`inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/70 bg-white px-4 font-inter text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 ${
                isSaved ? "text-orange-600" : "text-slate-700"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              {saving ? "Saving..." : isSaved ? "Saved" : "Save"}
            </button>
            <button
              onClick={handleCompareClick}
              className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/70 bg-white px-4 font-inter text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Compare
            </button>
            <Button
              onClick={handleWriteReviewClick}
              className="h-10 shrink-0 whitespace-nowrap rounded-full bg-orange-500 px-5 font-inter text-sm font-semibold text-white hover:bg-orange-600"
            >
              Write Review
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-5 md:gap-8">
          <div className="shrink-0">
            <CompanyLogo
              website={website}
              companyName={companyName}
              companyAbbreviation={companyAbbreviation}
              className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-white shadow-lg md:h-24 md:w-24"
              imgClassName="h-16 w-16 object-contain md:h-20 md:w-20"
              fallbackClassName="text-blue-600 font-bold text-2xl md:text-3xl"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-3 flex flex-wrap items-start gap-3">
              <h1 className="font-plus-jakarta text-3xl font-bold leading-tight text-white md:text-[42px]">
                {titleText}
              </h1>
              {isPartner && (
                <div className="group relative mt-2 shrink-0">
                  <svg
                    className="h-6 w-6 cursor-help text-blue-200"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Mitra Binus Enrichment Program
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {subcategoryName && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/15 px-4 py-1.5 font-inter text-sm text-white/95 backdrop-blur-sm">
                  <BriefcaseBusiness className="h-4 w-4" />
                  {subcategoryName}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="font-inter text-lg font-semibold leading-none text-white md:text-xl">
                  {rating !== null && rating !== undefined
                    ? rating.toFixed(1).replace(".", ",")
                    : "—"}
                </span>
                <StarRating rating={rating} size="xs" />
              </div>
              <span className="font-inter text-xs text-white/90">
                {totalReviews || 0} {totalReviews === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>
        </div>
      </Container>
      </section>

      <CompanySelectModal
        open={isCompareModalOpen}
        currentCompanySlug={companySlug}
        onClose={() => setIsCompareModalOpen(false)}
      />

      {showAuthModal && (
        <UnauthenticatedModal
          redirectPath={location.pathname}
          onClose={() => setShowAuthModal(false)}
          message="You need to log in first to start sharing your internship experience."
        />
      )}
    </>
  );
};
