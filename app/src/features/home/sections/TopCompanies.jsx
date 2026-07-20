import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/StarRating';
import { getTopRatedCompanies } from '@/api/companyApi';
import { CompanyLogo } from '@/components/common/CompanyLogo';

const TopCompanyCard = ({ companyName, companyAbbreviation, website, subcategoryName, rating, totalReviews, companySlug }) => {
  return (
    <Link to={`/company/${companySlug}`} className="group block h-full w-[250px] shrink-0 snap-start sm:w-[270px]">
      <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <CompanyLogo
          website={website}
          companyName={companyName}
          companyAbbreviation={companyAbbreviation}
          className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2"
          fallbackClassName="bg-gray-50 text-gray-500 font-bold text-base rounded"
          showSkeleton
        />
        <h3 className="font-plus-jakarta mb-2 text-[15px] font-semibold leading-tight text-slate-900">
          {companyName}
        </h3>

        <div className="mb-2.5 flex items-center gap-1.5">
          <StarRating rating={rating} size="sm" className="text-[#F97316]" />
          <span className="font-inter text-sm font-semibold text-slate-900">
            {rating?.toFixed(1).replace('.', ',')}
          </span>
          <span className="font-inter text-xs text-slate-400">({totalReviews})</span>
        </div>

        <div>
          <span className="font-inter inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {subcategoryName}
          </span>
        </div>
      </div>
    </Link>
  );
};

export function TopCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopRatedCompanies()
      .then(data => { if (data.success) setCompanies(data.result); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="border-b border-slate-100 bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-plus-jakarta mb-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Top Reviewed Companies</h2>
            <p className="font-inter text-sm text-slate-500">Berdasarkan ulasan mahasiswa di seluruh Indonesia</p>
          </div>
          <Link to="/companies" className="font-inter flex items-center gap-1 text-sm font-semibold text-[#F97316] transition hover:opacity-80">
            View All <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="hide-scrollbar overflow-x-auto pb-2">
          <div className="flex min-w-max snap-x snap-mandatory gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[250px] shrink-0 rounded-xl border border-slate-200 bg-white p-5 sm:w-[270px]">
                  <Skeleton className="mb-3.5 h-12 w-12 rounded-xl" />
                  <Skeleton className="mb-2 h-4 w-2/3" />
                  <Skeleton className="mb-2.5 h-3 w-1/2" />
                  <Skeleton className="h-6 w-20 rounded-lg" />
                </div>
              ))
            : companies.map(c => <TopCompanyCard key={c.companyId} {...c} />)
          }
          </div>
        </div>
      </div>
    </section>
  );
}
