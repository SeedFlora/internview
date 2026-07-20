import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getTopCategories } from '@/api/categoryApi';

export function TopJobCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopCategories()
      .then(data => {
        if (data.success && data.result?.length > 0) {
          setCategories(data.result);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="border-b border-slate-100 bg-white py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-plus-jakarta mb-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Top Job Categories</h2>
            <p className="font-inter text-sm text-slate-500">Eksplorasi magang berdasarkan bidang studimu</p>
          </div>
          <Link to="/categories" className="font-inter flex items-center gap-1 text-sm font-semibold text-[#F97316] transition hover:opacity-80">
            View All <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-white p-4">
                  <Skeleton className="h-8 w-8 rounded-lg mb-3" />
                  <Skeleton className="h-4 w-24 mb-1.5" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            : categories.map((cat, i) => (
                <Link
                  key={i}
                  to={`/subcategory${cat.url}`}
                  state={{ subCategoryName: cat.subcategoryName, type: 'jobs' }}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                    <BriefcaseBusiness className="w-4 h-4 text-[#F97316]" />
                  </div>
                  <div>
                    <h3 className="font-plus-jakarta text-sm font-semibold text-slate-900">{cat.subcategoryName}</h3>
                    <p className="font-inter text-xs text-slate-500">{cat.totalReviews}+ reviews</p>
                  </div>
                </Link>
              ))
          }
        </div>
      </div>
    </section>
  );
}
