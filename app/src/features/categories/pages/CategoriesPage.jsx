import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { getCategories } from '@/api/categoryApi';
import {
  PawPrint,
  Mic,
  Sofa,
  UtensilsCrossed,
  Sparkles,
  Home,
  ShoppingBag,
  Briefcase,
  Car,
  Heart,
  GraduationCap,
  Wrench,
  Tag,
} from 'lucide-react';

const COLORS = [
  { bg: 'bg-amber-100', text: 'text-amber-900' },
  { bg: 'bg-sky-100', text: 'text-sky-900' },
  { bg: 'bg-emerald-100', text: 'text-emerald-900' },
  { bg: 'bg-blue-100', text: 'text-blue-900' },
  { bg: 'bg-indigo-100', text: 'text-indigo-900' },
  { bg: 'bg-violet-100', text: 'text-violet-900' },
  { bg: 'bg-cyan-100', text: 'text-cyan-900' },
  { bg: 'bg-pink-100', text: 'text-pink-900' },
];

const CATEGORY_ICONS = {
  'Animals & Pets': PawPrint,
  'Events & Entertainment': Mic,
  'Home & Garden': Sofa,
  'Restaurants & Bars': UtensilsCrossed,
  'Beauty & Well-being': Sparkles,
  'Food, Beverages & Tobacco': UtensilsCrossed,
  'Home Services': Home,
  'Shopping': ShoppingBag,
  'Professional Services': Briefcase,
  'Automotive': Car,
  'Health & Medical': Heart,
  'Education': GraduationCap,
  'Repair & Construction': Wrench,
};

const SkeletonCard = () => (
  <div className="break-inside-avoid mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="bg-gray-100 flex flex-col items-center justify-center py-8 px-4 gap-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-28" />
    </div>
    <div className="bg-white divide-y divide-gray-100">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState('companies');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const startTime = Date.now();
        const data = await getCategories(type);

        const elapsed = Date.now() - startTime;
        if (elapsed < 300) {
          await new Promise(resolve => setTimeout(resolve, 300 - elapsed));
        }

        if (data.success) {
          setCategories(data.result);
        } else {
          setError(data.message || 'Failed to fetch categories');
        }
      } catch {
        setError('Error fetching categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [type]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <Skeleton className="h-10 w-20 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
        <div className="columns-1 md:columns-3 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="mx-auto max-w-7xl px-6 py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="font-plus-jakarta text-[30px] font-bold leading-[1.2] tracking-[-0.02em] text-slate-900 md:text-[36px] lg:text-[38px]">
              {type === 'jobs' ? 'Explore Jobs by Category' : 'Explore Companies by Category'}
            </h1>
            <p className="max-w-[560px] font-inter text-[14px] leading-6 text-slate-600 md:text-[15px]">
              Temukan kategori yang sesuai minatmu dan mulai pencarian magangmu.
            </p>
          </div>
          <div className="inline-flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 md:mt-1">
            <Toggle
              pressed={type === 'jobs'}
              onPressedChange={(pressed) => pressed && setType('jobs')}
              className="h-10 rounded-xl px-4 font-inter text-sm font-semibold text-slate-600 data-[state=on]:bg-white data-[state=on]:text-slate-900 data-[state=on]:shadow-sm"
            >
              Jobs
            </Toggle>
            <Toggle
              pressed={type === 'companies'}
              onPressedChange={(pressed) => pressed && setType('companies')}
              className="h-10 rounded-xl px-4 font-inter text-sm font-semibold text-slate-600 data-[state=on]:bg-white data-[state=on]:text-slate-900 data-[state=on]:shadow-sm"
            >
              Companies
            </Toggle>
          </div>
        </div>

        <div className="mt-2 columns-1 gap-6 md:columns-3">
          {categories.map((category, index) => {
            const { bg, text } = COLORS[index % COLORS.length];
            const Icon = CATEGORY_ICONS[category.categoryName] ?? Tag;

            return (
              <div
                key={category.categoryId}
                className="break-inside-avoid mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className={`${bg} ${text} flex flex-col items-center justify-center gap-2 px-4 py-8`}>
                  <Icon className="h-8 w-8" strokeWidth={1.5} />
                  <span className="font-inter text-center text-base font-semibold leading-snug">
                    {category.categoryName}
                  </span>
                </div>
                <div className="divide-y divide-slate-100 bg-white">
                  {category.subCategories.map((sub) => (
                    <div
                      key={sub.subCategoryId}
                      onClick={() =>
                        navigate(`/subcategory/${encodeURIComponent(sub.subCategoryName)}/companies`, {
                          state: { subCategoryName: sub.subCategoryName, type },
                        })
                      }
                      className="cursor-pointer px-4 py-3 font-inter text-sm text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-700"
                    >
                      {sub.subCategoryName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
