import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanyLogo } from "@/components/common/CompanyLogo";
import { getCompanies, searchCompanies } from "@/api/companyApi";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";
import { Search, Star, X } from "lucide-react";

const MAX_RESULTS = 8;

const deduplicateCompanies = (companies = []) => {
  const map = new Map();

  companies.forEach((company) => {
    if (!company?.companyId || map.has(company.companyId)) return;
    map.set(company.companyId, company);
  });

  return Array.from(map.values());
};

export function CompanySelectModal({ open, currentCompanySlug, onClose, onCompare }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState([]);
  const [selectedCompanySlug, setSelectedCompanySlug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredCompanies = useMemo(
    () => companies.filter((item) => item.companySlug !== currentCompanySlug),
    [companies, currentCompanySlug]
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setCompanies([]);
      setSelectedCompanySlug(null);
      setError(null);
      return;
    }

    const fetchDefaultCompanies = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getCompanies(null, MAX_RESULTS);
        const { success, message, data } = handleApiResponse(response);

        if (!success) {
          setError(message || "Failed to load companies");
          return;
        }

        setCompanies(deduplicateCompanies(data || []).slice(0, MAX_RESULTS));
      } catch (err) {
        setError(normalizeErrorMessage(err, "Failed to load companies"));
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultCompanies();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const debounce = setTimeout(async () => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery) return;

      setLoading(true);
      setError(null);

      try {
        const response = await searchCompanies(trimmedQuery);
        const { success, message, data } = handleApiResponse(response);

        if (!success) {
          setError(message || "Failed to search companies");
          setCompanies([]);
          return;
        }

        setCompanies(deduplicateCompanies(data || []).slice(0, MAX_RESULTS));
      } catch (err) {
        setError(normalizeErrorMessage(err, "Failed to search companies"));
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounce);
  }, [query, open]);

  const handleCompare = () => {
    if (!selectedCompanySlug) return;

    const selectedCompany = filteredCompanies.find((item) => item.companySlug === selectedCompanySlug);

    if (onCompare) {
      onCompare(selectedCompanySlug, selectedCompany || null);
      onClose();
      return;
    }

    if (!currentCompanySlug) return;

    onClose();
    navigate(`/compare/${currentCompanySlug}/${selectedCompanySlug}`);
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-modal-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 id="compare-modal-title" className="font-plus-jakarta text-[30px] font-bold text-slate-900 md:text-[32px]">
            Which company would you like to compare?
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close compare modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for another company..."
              className="h-11 rounded-lg border-slate-300 pl-10 text-sm"
            />
          </div>

          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {loading && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Loading companies...
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
                {error}
              </div>
            )}

            {!loading && !error && filteredCompanies.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No company found. Try another keyword.
              </div>
            )}

            {!loading && !error && filteredCompanies.map((company) => {
              const isSelected = selectedCompanySlug === company.companySlug;

              return (
                <button
                  key={company.companyId}
                  type="button"
                  onClick={() => setSelectedCompanySlug(company.companySlug)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${isSelected
                    ? "border-orange-300 bg-orange-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <CompanyLogo
                        website={company.website}
                        companyName={company.companyName}
                        companyAbbreviation={company.companyAbbreviation}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white"
                        imgClassName="h-8 w-8 object-contain"
                        fallbackClassName="text-base font-semibold text-slate-600"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-inter text-xl font-semibold text-slate-900">
                          {company.companyName}
                        </p>
                        <div className="mt-1 flex items-center text-sm text-slate-500">
                          <span>{company.subcategoryName || "No category"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-inter text-sm font-semibold text-slate-800">
                      <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                      {company.rating !== null && company.rating !== undefined ? company.rating.toFixed(1) : "-"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-11 rounded-xl px-6">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCompare}
              disabled={!selectedCompanySlug}
              className="h-11 rounded-xl bg-orange-500 px-7 font-semibold text-white hover:bg-orange-600"
            >
              Compare
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
