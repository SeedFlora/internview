import React, { useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { CompanyLogo } from "@/components/common/CompanyLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanySelectModal } from "../components/comparison/CompanySelectModal";
import { ComparisonDataGrid } from "../components/comparison/ComparisonDataGrid";
import { useCompareCompanies } from "../hooks/useCompareCompanies";
import { ArrowLeftRight, Plus, Star } from "lucide-react";

const formatObjectEntries = (value) => {
  if (!value || typeof value !== "object") return "-";

  const entries = Object.entries(value);
  if (entries.length === 0) return "-";

  return `• ${entries.map(([key, val]) => `${key}: ${val}`).join("\n• ")}`;
};

const SectionCard = ({ title, children }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-6">
    <h2 className="mb-4 font-plus-jakarta text-[22px] font-bold tracking-[-0.02em] text-slate-900">{title}</h2>
    {children}
  </div>
);

const RATING_ITEMS = [
  { key: "workCulture", label: "Budaya Kerja" },
  { key: "learningOpp", label: "Kesempatan Belajar" },
  { key: "mentorship", label: "Mentorship" },
  { key: "benefit", label: "Benefit" },
  { key: "workLifeBalance", label: "Work-Life Balance" },
];

const DifficultyPill = ({ rating, count }) => {
  const safeRating = typeof rating === "number" ? rating : null;
  const ratio = safeRating ? (safeRating / 5) * 100 : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-end justify-between gap-3">
        <p className="font-plus-jakarta text-3xl font-bold text-slate-900">
          {safeRating !== null ? safeRating.toFixed(1) : "-"}
        </p>
        <p className="font-inter text-xs text-slate-500">{count || 0} reviews</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-orange-500" style={{ width: `${ratio}%` }} />
      </div>
      <p className="mt-2 font-inter text-xs text-slate-500">Average difficulty level</p>
    </div>
  );
};

const CompareRatingsSection = ({ leftRatings, rightRatings, leftLabel, rightLabel }) => (
  <div className="space-y-4">
    <div className="hidden grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 border-b border-slate-200 pb-2 md:grid">
      <p className="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Metrics</p>
      <p className="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{leftLabel}</p>
      <p className="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{rightLabel}</p>
    </div>
    {RATING_ITEMS.map((item) => {
      const left = leftRatings?.[item.key] ?? null;
      const right = rightRatings?.[item.key] ?? null;
      return (
        <div key={item.key} className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] md:items-center">
          <p className="font-inter text-sm font-semibold text-slate-800">{item.label}</p>
          {[{ value: left, label: leftLabel }, { value: right, label: rightLabel }].map((entry, idx) => {
            const ratio = typeof entry.value === "number" ? (entry.value / 5) * 100 : 0;
            return (
              <div key={`${item.key}-${idx}`} className="space-y-1 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 md:hidden">{entry.label}</p>
                  <p className="font-inter text-sm font-semibold text-slate-900">{typeof entry.value === "number" ? entry.value.toFixed(1) : "-"}</p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: `${ratio}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      );
    })}
  </div>
);

const CompareRecruitmentSection = ({ leftStats, rightStats, leftLabel, rightLabel }) => {
  const leftTrack = formatObjectEntries(leftStats?.admissionTrack);
  const rightTrack = formatObjectEntries(rightStats?.admissionTrack);
  const leftDuration = leftStats?.recruitmentDuration || "-";
  const rightDuration = rightStats?.recruitmentDuration || "-";
  const leftSelection = formatObjectEntries(leftStats?.frequentSelectionProcess);
  const rightSelection = formatObjectEntries(rightStats?.frequentSelectionProcess);

  const RecruitmentRow = ({ label, leftValue, rightValue }) => (
    <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-4">
      <p className="font-inter text-sm font-semibold text-slate-800 md:pt-2">{label}</p>
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <p className="mb-1 font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 md:hidden">{leftLabel}</p>
        <p className="whitespace-pre-line break-words font-inter text-sm leading-7 text-slate-700">{leftValue}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <p className="mb-1 font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 md:hidden">{rightLabel}</p>
        <p className="whitespace-pre-line break-words font-inter text-sm leading-7 text-slate-700">{rightValue}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="hidden grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 border-b border-slate-200 pb-2 md:grid">
        <p className="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Metrics</p>
        <p className="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{leftLabel}</p>
        <p className="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{rightLabel}</p>
      </div>
      <RecruitmentRow label="Popular Admission Track" leftValue={leftTrack} rightValue={rightTrack} />
      <RecruitmentRow label="Recruitment Duration" leftValue={leftDuration} rightValue={rightDuration} />
      <RecruitmentRow label="Frequent Selection Process" leftValue={leftSelection} rightValue={rightSelection} />
    </div>
  );
};

const SelectionCard = ({ company, onClick }) => {
  const hasCompany = Boolean(company?.companySlug);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:bg-slate-50"
      aria-label={hasCompany ? "Choose company" : "Choose company"}
    >
      {hasCompany ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CompanyLogo
              website={company.website}
              companyName={company.companyName}
              companyAbbreviation={company.companyAbbreviation}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white"
              imgClassName="h-11 w-11 object-contain"
              fallbackClassName="text-xl font-bold text-slate-600"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-plus-jakarta text-[26px] font-bold text-slate-900">{company.companyName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>{company.subcategoryName || "No category"}</span>
                <span>{company.totalReviews || 0} reviews</span>
              </div>
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-inter text-sm font-semibold text-slate-800">
            <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
            {company.rating !== null && company.rating !== undefined ? company.rating.toFixed(1) : "-"}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[84px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white">
              <Plus className="h-5 w-5" />
            </div>
            <p className="font-inter text-sm font-medium">Choose company</p>
          </div>
        </div>
      )}
    </button>
  );
};

export const CompareLandingPage = () => {
  const [activePicker, setActivePicker] = useState(null);
  const [leftCompany, setLeftCompany] = useState(null);
  const [rightCompany, setRightCompany] = useState(null);

  const leftCompanySlug = leftCompany?.companySlug;
  const rightCompanySlug = rightCompany?.companySlug;

  const { leftCompanyData, rightCompanyData, loading, error } = useCompareCompanies(
    leftCompanySlug,
    rightCompanySlug
  );

  const handleCompanySelect = (selectedSlug, selectedCompany) => {
    if (!selectedSlug || !selectedCompany) return;

    if (activePicker === "left") {
      setLeftCompany(selectedCompany);
    }

    if (activePicker === "right") {
      setRightCompany(selectedCompany);
    }

    setActivePicker(null);
  };

  const handleSwapCompanies = () => {
    setLeftCompany(rightCompany);
    setRightCompany(leftCompany);
  };

  const compareError =
    leftCompany?.companySlug &&
    rightCompany?.companySlug &&
    leftCompany.companySlug === rightCompany.companySlug
      ? "Please choose two different companies."
      : null;

  const isReadyToCompare = Boolean(leftCompanySlug && rightCompanySlug && !compareError);

  const leftDisplay = leftCompanyData?.company || leftCompany;
  const rightDisplay = rightCompanyData?.company || rightCompany;

  const internshipRows = useMemo(() => {
    const leftInfo = leftCompanyData?.internshipInformation;
    const rightInfo = rightCompanyData?.internshipInformation;

    return [
      {
        key: "workScheme",
        label: "Skema Kerja",
        leftValue: leftInfo?.workScheme?.join(", "),
        rightValue: rightInfo?.workScheme?.join(", "),
      },
      {
        key: "duration",
        label: "Durasi Rata-rata",
        leftValue: leftInfo?.duration,
        rightValue: rightInfo?.duration,
      },
      {
        key: "popularCategories",
        label: "Kategori Populer",
        leftValue: leftInfo?.subCategories?.join(", "),
        rightValue: rightInfo?.subCategories?.join(", "),
      },
      {
        key: "internshipType",
        label: "Jenis Magang",
        leftValue: leftInfo?.type,
        rightValue: rightInfo?.type,
      },
    ];
  }, [leftCompanyData, rightCompanyData]);

  const leftRatings = leftCompanyData?.ratings;
  const rightRatings = rightCompanyData?.ratings;
  const leftStats = leftCompanyData?.recruitmentStatistics;
  const rightStats = rightCompanyData?.recruitmentStatistics;

  return (
    <>
      <section className="border-b border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-100 py-8 md:py-10">
        <Container>
          <div className="max-w-3xl space-y-3">
            <h1 className="font-plus-jakarta text-[30px] font-bold leading-[1.2] tracking-[-0.02em] text-slate-900 md:text-[38px]">
              Compare Companies
            </h1>
            <p className="font-inter text-base leading-7 text-slate-600">
              Pilih dua perusahaan yang ingin dibandingkan. Mulai dari menekan kartu +, lalu pilih perusahaan kiri dan perusahaan kanan.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-8 md:py-10">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] md:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <SelectionCard
              company={leftDisplay}
              onClick={() => setActivePicker("left")}
            />

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapCompanies}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
                aria-label="Swap companies"
                title="Swap companies"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </button>
            </div>

            <SelectionCard
              company={rightDisplay}
              onClick={() => setActivePicker("right")}
            />
          </div>

          <div className="mt-6">
            {compareError && (
              <p className="font-inter text-sm text-red-600">{compareError}</p>
            )}

            {!isReadyToCompare && !compareError && (
              <p className="font-inter text-sm text-slate-600">Pilih dua perusahaan untuk langsung menampilkan hasil perbandingan.</p>
            )}

            {loading && isReadyToCompare && (
              <div className="mt-2 space-y-3">
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
              </div>
            )}

            {!loading && error && isReadyToCompare && (
              <div className="mt-2 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="font-inter text-sm text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && isReadyToCompare && leftCompanyData && rightCompanyData && (
              <div className="mt-6 space-y-4">
                <SectionCard title="Internship Information">
                  <ComparisonDataGrid
                    rows={internshipRows}
                    leftLabel={leftCompanyData.company.companyAbbreviation || leftCompanyData.company.companyName || "Left"}
                    rightLabel={rightCompanyData.company.companyAbbreviation || rightCompanyData.company.companyName || "Right"}
                  />
                </SectionCard>

                <SectionCard title="Reviews Rating">
                  <CompareRatingsSection
                    leftRatings={leftRatings}
                    rightRatings={rightRatings}
                    leftLabel={leftCompanyData.company.companyAbbreviation || leftCompanyData.company.companyName || "Left"}
                    rightLabel={rightCompanyData.company.companyAbbreviation || rightCompanyData.company.companyName || "Right"}
                  />
                </SectionCard>

                <SectionCard title="Average Difficulty">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-2 font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        {leftCompanyData.company.companyAbbreviation || leftCompanyData.company.companyName || "Left"}
                      </p>
                      <DifficultyPill rating={leftCompanyData?.difficulty?.rating} count={leftCompanyData?.difficulty?.count} />
                    </div>
                    <div>
                      <p className="mb-2 font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        {rightCompanyData.company.companyAbbreviation || rightCompanyData.company.companyName || "Right"}
                      </p>
                      <DifficultyPill rating={rightCompanyData?.difficulty?.rating} count={rightCompanyData?.difficulty?.count} />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Recruitment Process">
                  <CompareRecruitmentSection
                    leftStats={leftStats}
                    rightStats={rightStats}
                    leftLabel={leftCompanyData.company.companyAbbreviation || leftCompanyData.company.companyName || "Left"}
                    rightLabel={rightCompanyData.company.companyAbbreviation || rightCompanyData.company.companyName || "Right"}
                  />
                </SectionCard>
              </div>
            )}
          </div>
        </div>
      </Container>

      <CompanySelectModal
        open={Boolean(activePicker)}
        currentCompanySlug={activePicker === "left" ? rightCompany?.companySlug : leftCompany?.companySlug}
        onClose={() => setActivePicker(null)}
        onCompare={handleCompanySelect}
      />
    </>
  );
};
