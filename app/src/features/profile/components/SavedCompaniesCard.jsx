import React from "react";
import { Link } from "react-router-dom";
import { BookmarkMinus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkeletonLine } from "@/components/ui/skeleton";


const getCompanySlug = (company) => company?.companySlug

const getCompanyName = (company) => company?.companyName

const getCompanyMeta = (company) => company?.subcategoryName;

export const SavedCompaniesCard = ({
  companies,
  loading,
  error,
  onUnsave,
  unsaveLoadingSlug,
}) => {
  return (
    <Card className="rounded-2xl border border-slate-200">
      <CardHeader className="space-y-1 pb-3">
        <h2 className="font-plus-jakarta text-xl font-bold text-slate-900">Saved Companies</h2>
        <p className="font-inter text-sm text-slate-500">Companies you saved for later</p>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="space-y-3">
            <SkeletonLine height="h-16" />
            <SkeletonLine height="h-16" />
          </div>
        )}

        {!loading && error && (
          <p className="font-inter text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && companies.length === 0 && (
          <p className="font-inter text-sm text-slate-500">No saved companies yet.</p>
        )}

        {!loading && !error && companies.length > 0 && (
          <div className="space-y-3">
            {companies.map((company, index) => {
              const companySlug = getCompanySlug(company);
              const isUnsaveLoading = unsaveLoadingSlug === companySlug;

              return (
                <div key={companySlug ?? index} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-plus-jakarta text-base font-semibold text-slate-900">
                        {getCompanyName(company)}
                      </p>
                      <p className="font-inter text-sm text-slate-500">{getCompanyMeta(company)}</p>
                    </div>

                    <button
                      onClick={() => onUnsave(company)}
                      disabled={isUnsaveLoading || !companySlug}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                      title="Remove from saved companies"
                    >
                      <BookmarkMinus className="h-3.5 w-3.5" />
                      {isUnsaveLoading ? "Removing..." : "Unsave"}
                    </button>
                  </div>

                  {companySlug ? (
                    <Link
                      to={`/company/${companySlug}`}
                      className="font-inter mt-2 inline-block text-xs font-semibold text-orange-600 hover:text-orange-700"
                    >
                      Open company page
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
