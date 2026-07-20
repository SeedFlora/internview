import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { CompanyLogo } from "@/components/common/CompanyLogo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompareCompanies } from "../hooks/useCompareCompanies";
import { ComparisonDataGrid } from "../components/comparison/ComparisonDataGrid";
import { CompanySelectModal } from "../components/comparison/CompanySelectModal";
import { ArrowLeft, ArrowLeftRight, Star } from "lucide-react";

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
            const ratio = typeof entry.value === 'number' ? (entry.value / 5) * 100 : 0;
            return (
              <div key={`${item.key}-${idx}`} className="space-y-1 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 md:hidden">{entry.label}</p>
                  <p className="font-inter text-sm font-semibold text-slate-900">{typeof entry.value === 'number' ? entry.value.toFixed(1) : '-'}</p>
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
  const leftDuration = leftStats?.recruitmentDuration || '-';
  const rightDuration = rightStats?.recruitmentDuration || '-';
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

const CompanyHeader = ({ data }) => {
  const company = data?.company;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <CompanyLogo
          website={company?.website}
          companyName={company?.companyName}
          companyAbbreviation={company?.companyAbbreviation}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white"
          imgClassName="h-11 w-11 object-contain"
          fallbackClassName="text-xl font-bold text-slate-600"
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-plus-jakarta text-[26px] font-bold text-slate-900">
            {company?.companyName || "Unknown Company"}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{company?.subcategoryName || "No category"}</span>
            <span>{company?.totalReviews || 0} reviews</span>
          </div>
        </div>

        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-inter text-sm font-semibold text-slate-800">
          <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
          {company?.rating !== null && company?.rating !== undefined
            ? company.rating.toFixed(1)
            : "-"}
        </div>
      </div>
    </div>
  );
};

const CompareLoading = () => (
  <Container className="py-10">
    <div className="space-y-4">
      <Skeleton className="h-7 w-52" />
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-6 w-[500px]" />
    </div>
    <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-14 w-14 rounded-xl" />
      <Skeleton className="h-24 rounded-2xl" />
    </div>
    <div className="mt-6 space-y-4">
      {[1, 2, 3, 4].map((item) => (
        <Skeleton key={item} className="h-52 rounded-2xl" />
      ))}
    </div>
  </Container>
);

export const CompareCompaniesPage = () => {
  const navigate = useNavigate();
  const { leftCompanySlug, rightCompanySlug } = useParams();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const isInvalidComparePair = !leftCompanySlug || !rightCompanySlug || leftCompanySlug === rightCompanySlug;

  const { leftCompanyData, rightCompanyData, loading, error } = useCompareCompanies(
    leftCompanySlug,
    rightCompanySlug
  );

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

  if (isInvalidComparePair) {
    return (
      <Container className="py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="font-plus-jakarta text-3xl font-bold text-red-700">Invalid compare pair</h1>
          <p className="mt-2 text-sm text-red-600">
            Please select two different companies to compare.
          </p>
            <Button onClick={() => navigate("/companies")} className="mt-5 rounded-xl bg-orange-500 text-white hover:bg-orange-600">
              Back to Companies
          </Button>
        </div>
      </Container>
    );
  }

  if (loading) {
    return <CompareLoading />;
  }

  if (error || !leftCompanyData || !rightCompanyData) {
    return (
      <Container className="py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="font-plus-jakarta text-3xl font-bold text-red-700">Failed to compare companies</h1>
          <p className="mt-2 text-sm text-red-600">{error || "Comparison data is unavailable."}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl border-red-300 text-red-700 hover:bg-red-100">
              Go Back
            </Button>
            <Button onClick={() => navigate(`/company/${leftCompanySlug}`)} className="rounded-xl bg-orange-500 text-white hover:bg-orange-600">
              Open {leftCompanyData?.company?.companyName || "Company"}
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <>
      <section className="border-b border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-100 py-7 md:py-9">
        <Container>
          <div className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/company/${leftCompanySlug}`)}
              className="-ml-3 h-9 rounded-xl px-3 text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {leftCompanyData.company.companyAbbreviation || "company"}
            </Button>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <div className="max-w-4xl space-y-3">
                <h1 className="font-plus-jakarta text-[30px] font-bold leading-[1.2] tracking-[-0.02em] text-slate-900 md:text-[36px] lg:text-[38px]">
                  Compare Companies
                </h1>
                <p className="max-w-3xl font-inter text-base leading-7 text-slate-600">
                  {leftCompanyData.company.companyName} vs {rightCompanyData.company.companyName}: Bandingkan pengalaman magang di dua perusahaan ini untuk melihat perbedaan budaya kerja, proses rekrutmen, dan peluang belajar.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPickerOpen(true)}
                className="w-full rounded-full border-slate-200 px-5 text-slate-700 hover:bg-slate-100 lg:w-auto"
              >
                Choose Different Company
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-7">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:p-6">
          <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <CompanyHeader data={leftCompanyData} />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => navigate(`/compare/${rightCompanySlug}/${leftCompanySlug}`)}
                className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:bg-slate-100"
                aria-label="Swap compared company positions"
                title="Swap companies"
              >
                <ArrowLeftRight className="h-6 w-6 text-slate-500" />
              </button>
            </div>
            <CompanyHeader data={rightCompanyData} />
          </div>

          <SectionCard title="Internship Information">
            <ComparisonDataGrid
              rows={internshipRows}
              leftLabel={leftCompanyData.company.companyAbbreviation || "Left"}
              rightLabel={rightCompanyData.company.companyAbbreviation || "Right"}
            />
          </SectionCard>

          <SectionCard title="Reviews Rating">
            <CompareRatingsSection
              leftRatings={leftRatings}
              rightRatings={rightRatings}
              leftLabel={leftCompanyData.company.companyAbbreviation || "Left"}
              rightLabel={rightCompanyData.company.companyAbbreviation || "Right"}
            />
          </SectionCard>

          <SectionCard title="Average Difficulty">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-2 font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  {leftCompanyData.company.companyAbbreviation || "Left"}
                </p>
                <DifficultyPill rating={leftCompanyData?.difficulty?.rating} count={leftCompanyData?.difficulty?.count} />
              </div>
              <div>
                <p className="mb-2 font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  {rightCompanyData.company.companyAbbreviation || "Right"}
                </p>
                <DifficultyPill rating={rightCompanyData?.difficulty?.rating} count={rightCompanyData?.difficulty?.count} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Recruitment Process">
            <CompareRecruitmentSection
              leftStats={leftStats}
              rightStats={rightStats}
              leftLabel={leftCompanyData.company.companyAbbreviation || "Left"}
              rightLabel={rightCompanyData.company.companyAbbreviation || "Right"}
            />
          </SectionCard>
        </div>
      </Container>

      <CompanySelectModal
        open={isPickerOpen}
        currentCompanySlug={leftCompanySlug}
        onClose={() => setIsPickerOpen(false)}
        onCompare={(selectedSlug) => navigate(`/compare/${leftCompanySlug}/${selectedSlug}`)}
      />
    </>
  );
};
