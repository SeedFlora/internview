import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { getCompanies, getCompaniesBySubcategory } from '@/api/companyApi';
import { getSubCategorySummary } from '@/api/categoryApi';
import { CompanyCardHorizontal } from '@/features/companies/components/list/CompanyCardHorizontal';
import { CompanyFilterDropdown } from '@/features/companies/components/list/CompanyFilterDropdown';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { BackButton } from '@/components/common/BackButton';
import { Search, Building2, Star, BriefcaseBusiness, Handshake } from 'lucide-react';

const toNumberOrNull = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const normalizeCompanyItem = (company) => {
  const rating = toNumberOrNull(
    company?.rating ?? company?.averageRating ?? company?.avgRating
  );
  const totalReviews = toNumberOrNull(
    company?.totalReviews ?? company?.reviewCount ?? company?.totalReview ?? company?.totalReviewCount
  );

  return {
    ...company,
    rating,
    totalReviews: totalReviews === null ? 0 : Math.max(0, Math.round(totalReviews)),
    subcategoryName:
      company?.subcategoryName ??
      company?.subCategoryName ??
      company?.subcategory?.subCategoryName ??
      company?.subCategory?.subCategoryName ??
      null,
  };
};

const normalizeName = (value) => String(value || '').trim().toLowerCase();

const buildCompanyLookup = (companies) => {
  const bySlug = new Map();
  const byId = new Map();
  const byName = new Map();

  companies.forEach((company) => {
    if (company?.companySlug) {
      bySlug.set(String(company.companySlug), company);
    }
    if (company?.companyId !== null && company?.companyId !== undefined) {
      byId.set(String(company.companyId), company);
    }
    const nameKey = normalizeName(company?.companyName);
    if (nameKey) {
      byName.set(nameKey, company);
    }
  });

  return { bySlug, byId, byName };
};

const enrichCompaniesWithCatalog = (subcategoryCompanies, catalogCompanies) => {
  const lookup = buildCompanyLookup(catalogCompanies);

  return subcategoryCompanies.map((company) => {
    const matched =
      (company?.companySlug && lookup.bySlug.get(String(company.companySlug))) ||
      ((company?.companyId !== null && company?.companyId !== undefined)
        ? lookup.byId.get(String(company.companyId))
        : null) ||
      lookup.byName.get(normalizeName(company?.companyName));

    if (!matched) {
      return company;
    }

    return {
      ...company,
      website: company?.website || matched?.website || null,
      isPartner: company?.isPartner ?? matched?.isPartner ?? null,
      rating: company?.rating ?? matched?.rating ?? null,
      totalReviews: (company?.totalReviews || 0) > 0
        ? company.totalReviews
        : (matched?.totalReviews || 0),
      subcategoryName: company?.subcategoryName || matched?.subcategoryName || null,
    };
  });
};

export const SubCategoryCompaniesPage = () => {
  const { subCategoryName: subCategoryNameParam } = useParams();
  const location = useLocation();
  const subCategoryName = location.state?.subCategoryName || decodeURIComponent(subCategoryNameParam) || 'Subcategory';
  const queryType = new URLSearchParams(location.search).get('type');
  const resolvedType = (location.state?.type || queryType || 'companies').toLowerCase();
  const categoryType = resolvedType === 'jobs' ? 'jobs' : 'companies';

  const [companies, setCompanies] = useState([]);
  const [meta, setMeta] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const [companiesData, summaryResult] = await Promise.allSettled([
          getCompaniesBySubcategory(subCategoryName, categoryType, null, 80),
          getSubCategorySummary(subCategoryName),
        ]);

        if (summaryResult.status === 'fulfilled' && summaryResult.value?.success) {
          setSummary(summaryResult.value.result || null);
        } else {
          setSummary(null);
        }

        if (companiesData.status !== 'fulfilled') {
          throw companiesData.reason;
        }

        const data = companiesData.value;
        if (data.success) {
          const normalizedSubcategoryCompanies = Array.isArray(data.result)
            ? data.result.map(normalizeCompanyItem)
            : [];

          // Fetch full catalog only when subcategory payload is incomplete.
          const needsCatalogEnrichment = normalizedSubcategoryCompanies.some(
            (company) => company?.rating === null || (company?.totalReviews || 0) === 0
          );

          let enrichedCompanies = normalizedSubcategoryCompanies;
          if (needsCatalogEnrichment) {
            try {
              const allCompaniesResponse = await getCompanies(null, 300);
              const allCompanies = allCompaniesResponse?.success && Array.isArray(allCompaniesResponse.result)
                ? allCompaniesResponse.result.map(normalizeCompanyItem)
                : [];
              enrichedCompanies = enrichCompaniesWithCatalog(normalizedSubcategoryCompanies, allCompanies);
            } catch {
              // Keep base subcategory data if catalog enrichment request fails.
              enrichedCompanies = normalizedSubcategoryCompanies;
            }
          }

          setCompanies(enrichedCompanies);
          setMeta(data.meta);
        } else {
          setError(data.message || 'Failed to load companies');
        }
      } catch {
        setError('An error occurred while loading companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [subCategoryName, categoryType]);

  const stats = React.useMemo(() => {
    const totalCompanies = summary?.totalCompanies ?? companies.length;
    const totalReviews = summary?.totalReviews ?? companies.reduce((sum, item) => sum + (item?.totalReviews || 0), 0);
    const ratings = companies
      .map((item) => item?.rating)
      .filter((value) => typeof value === 'number');
    const fallbackAvgRating = ratings.length
      ? Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1))
      : null;
    const avgRating = typeof summary?.avgRating === 'number'
      ? Number(summary.avgRating.toFixed(1))
      : fallbackAvgRating;
    const partnerCount = summary?.totalPartnerCompanies ?? companies.filter((item) => item?.isPartner).length;

    return { totalCompanies, totalReviews, avgRating, partnerCount };
  }, [companies, summary]);

  const filteredCompanies = React.useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return companies.filter((company) => {
      const textBlob = [
        company?.companyName,
        company?.companyAbbreviation,
        company?.subcategoryName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = keyword.length === 0 || textBlob.includes(keyword);

      if (!matchesSearch) return false;

      if (activeFilter === 'partner') return Boolean(company?.isPartner);
      if (activeFilter === 'top-rated') return typeof company?.rating === 'number' && company.rating >= 4;
      if (activeFilter === 'most-reviewed') return (company?.totalReviews || 0) >= 50;

      return true;
    });
  }, [companies, search, activeFilter]);

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'top-rated', label: 'Rating 4.0+' },
    { id: 'most-reviewed', label: 'Most Reviewed' },
    { id: 'partner', label: 'Partner' },
  ];

  if (loading) {
    return (
      <div className="bg-slate-50">
        <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 py-10 md:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_42%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.14),transparent_34%)]" />

          <Container className="relative z-10">
            <BackButton
              variant="ghost"
              label="Back to Categories"
              className="mb-6 inline-flex items-center gap-2 text-white/90 hover:bg-white/15 hover:text-white"
            />

            <Skeleton className="h-12 w-80 bg-white/25" />
            <Skeleton className="mt-3 h-5 w-full max-w-2xl bg-white/20" />
            <Skeleton className="mt-2 h-5 w-full max-w-xl bg-white/20" />
          </Container>
        </section>

        <div className="py-10 md:py-12">
          <Container>
            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[186px] rounded-2xl" />
              ))}
            </div>
          </Container>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50">
        <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 py-10 md:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_42%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.14),transparent_34%)]" />

          <Container className="relative z-10">
            <BackButton
              variant="ghost"
              label="Back to Categories"
              className="inline-flex items-center gap-2 text-white/90 hover:bg-white/15 hover:text-white"
            />
          </Container>
        </section>

        <div className="py-10 md:py-12">
          <Container>
            <ErrorMessage message={error} />
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 py-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.14),transparent_34%)]" />

        <Container className="relative z-10">
          <BackButton
            variant="ghost"
            label="Back to Categories"
            className="mb-6 inline-flex items-center gap-2 text-white/90 hover:bg-white/15 hover:text-white"
          />

          <div className="space-y-4">
            <h1 className="max-w-4xl font-plus-jakarta text-3xl font-bold tracking-[-0.03em] text-white md:text-[42px] md:leading-[1.05] lg:text-[46px]">
              {subCategoryName}
            </h1>
            <p className="max-w-3xl font-inter text-sm leading-7 text-slate-200 md:text-base md:leading-8">
              Temukan perusahaan terbaik di subkategori ini, bandingkan rating, dan baca ulasan magang untuk menemukan yang paling sesuai.
            </p>
          </div>
        </Container>
      </section>

      <div className="py-10 md:py-12">
        <Container>
          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <Building2 className="h-4 w-4" />
              </div>
              <p className="font-plus-jakarta text-2xl font-bold text-slate-900">{stats.totalCompanies}</p>
              <p className="font-inter text-xs text-slate-500">Total Companies</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <BriefcaseBusiness className="h-4 w-4" />
              </div>
              <p className="font-plus-jakarta text-2xl font-bold text-slate-900">{stats.totalReviews}</p>
              <p className="font-inter text-xs text-slate-500">Total Reviews</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <Star className="h-4 w-4" />
              </div>
              <p className="font-plus-jakarta text-2xl font-bold text-slate-900">{stats.avgRating ?? '-'}</p>
              <p className="font-inter text-xs text-slate-500">Average Rating</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <Handshake className="h-4 w-4" />
              </div>
              <p className="font-plus-jakarta text-2xl font-bold text-slate-900">{stats.partnerCount}</p>
              <p className="font-inter text-xs text-slate-500">Partner Companies</p>
            </div>
          </div>

          <div className="mb-4 flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-[520px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search companies..."
                className="h-10 rounded-xl border-slate-200 bg-white pl-10 font-inter text-sm"
              />
            </div>

            <div className="w-full md:w-auto">
              <CompanyFilterDropdown
                options={filterOptions}
                activeValue={activeFilter}
                onChange={setActiveFilter}
              />
            </div>
          </div>

          <p className="mb-4 font-inter text-sm text-slate-500">
            Showing {filteredCompanies.length} of {summary?.totalCompanies ?? meta?.totalElements ?? meta?.size ?? companies.length} companies
          </p>

          {filteredCompanies.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center shadow-sm">
              <p className="font-inter text-base text-slate-500">No companies match the current filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompanies.map((company) => (
                <CompanyCardHorizontal
                  key={company.companyId}
                  companyName={company.companyName}
                  companyAbbreviation={company.companyAbbreviation}
                  website={company.website}
                  isPartner={company.isPartner}
                  companySlug={company.companySlug}
                  subcategoryName={company.subcategoryName}
                  rating={company.rating}
                  totalReviews={company.totalReviews}
                  hideSubcategoryBadge
                />
              ))}
            </div>
          )}
        </Container>
      </div>
      </div>
    );
};
