import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SearchBar } from "@/components/common/SearchBar";
import { getTopRatedCompanies } from "@/api/companyApi";
import { Skeleton } from "@/components/ui/skeleton";
import internPics from "@/assets/intern.jpeg";

export function HeroSection() {
  const [popularCompanies, setPopularCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTopRatedCompanies()
      .then(data => {
        if (!cancelled && data.success) setPopularCompanies(data.result.slice(0, 3));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-white py-4 md:py-6 lg:py-0">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52vw] lg:block">
        <img
          src={internPics}
          alt="Intern working on laptop"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/30 to-white" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 flex min-h-[340px] items-center md:min-h-[380px] lg:min-h-[480px]">
          <div className="w-full max-w-[640px] py-1 lg:w-[52%] lg:py-6">
              <h1 className="font-plus-jakarta mb-4 text-[34px] font-bold leading-[1.15] tracking-[-0.015em] text-slate-900 md:text-[42px]">
              Temukan Tempat <br className="hidden md:block" /> Magang Impianmu
            </h1>
            <p className="font-inter mb-5 max-w-[590px] text-[15px] leading-[1.65] text-slate-600 md:text-[17px]">
              Platform ulasan magang dari mahasiswa, untuk mahasiswa. Cari tahu tempat magang terbaik melalui ulasan mahasiswa dan tingkatkan pengalaman magangmu!
            </p>

            <div className="mb-4 w-full max-w-[640px]">
              <SearchBar />
            </div>

            {(loading || popularCompanies.length > 0) && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-inter text-sm font-semibold text-slate-500">Populer:</span>
                <div className="flex flex-wrap gap-2">
                  {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-7 w-20 rounded-full" />
                      ))
                    : popularCompanies.map(({ companyId, companyName, companySlug }) => (
                        <Link
                          key={companyId}
                          to={`/company/${companySlug}`}
                          className="font-inter rounded-full bg-slate-100 px-4 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-200"
                        >
                          {companyName}
                        </Link>
                      ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
