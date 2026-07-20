import React from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Star } from "lucide-react";
import { useLogoValidation } from "@/features/companies/hooks/useLogoValidation";
import { getInitials } from "@/utils/avatar";
import { slugify } from "../utils/reviewTextUtils";

const pickLabel = (...values) =>
  values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();

export const RecentReviewCard = ({
  testimony,
  createdBy,
  averageRating,
  companyName,
  companySubCategory,
  companyWebsite,
  jobTitle,
  internshipHeaderId,
  className = "",
}) => {
  const resolvedCompanyWebsite = pickLabel(companyWebsite) || "";
  const { logoUrl, logoValid } = useLogoValidation(resolvedCompanyWebsite);
  const companyInitial = companyName?.charAt(0)?.toUpperCase() || "?";
  const slug = slugify(companyName);
  const reviewId = internshipHeaderId;
  const detailPath = `/company/${slug}/review/${reviewId}`;


  const initialsValue = createdBy
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join("");

  const CardContainer = detailPath ? Link : "div";
  const cardProps = detailPath ? { to: detailPath } : {};

  return (
    <CardContainer
      {...cardProps}
      className={`self-start flex h-auto min-h-46 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        detailPath ? "cursor-pointer" : ""
      } ${className}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F97316] text-primary-foreground font-semibold">
            {getInitials(initialsValue)}
          </div>
          <div className="min-w-0 space-y-1">
            <h4 className="font-plus-jakarta truncate text-sm font-semibold leading-tight text-slate-900">
              {createdBy}
            </h4>
            <p className="font-inter truncate text-[11px] leading-tight text-slate-600">
              {jobTitle}
            </p>
          </div>
        </div>
        <div className="font-inter flex shrink-0 items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600">
          <Star className="mr-1 h-3 w-3 fill-[#F97316] text-[#F97316]" />
          {typeof averageRating === "number" ? averageRating.toFixed(1).replace(".", ",") : "-"}
        </div>
      </div>

      <blockquote className="font-inter line-clamp-3 text-[13px] leading-normal text-slate-700">
        "{testimony}"
      </blockquote>

      <div className="mt-auto border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-50">
            {logoValid === true ? (
              <img src={logoUrl} alt={companyName} className="h-full w-full object-contain" />
            ) : logoValid === false ? (
              <span className="font-inter text-[10px] font-semibold text-slate-600">{companyInitial}</span>
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </div>

          <div className="min-w-0 leading-tight">
            <p className="font-plus-jakarta truncate text-xs font-semibold text-slate-900">{companyName}</p>
            <p className="font-inter truncate text-[11px] text-slate-500">{companySubCategory}</p>
          </div>
        </div>
      </div>
    </CardContainer>
  );
};
