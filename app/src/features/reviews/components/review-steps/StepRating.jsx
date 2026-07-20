import React from "react";
import { Users, BookOpen, GraduationCap, Heart, Scale } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";

const ratingCategories = [
  { key: "workCulture", label: "Budaya Kerja", Icon: Users },
  { key: "learningOpp", label: "Kesempatan Belajar", Icon: BookOpen },
  { key: "mentorship", label: "Bimbingan & Mentorship", Icon: GraduationCap },
  { key: "benefit", label: "Benefit & Fasilitas", Icon: Heart },
  { key: "workLifeBalance", label: "Work-Life Balance", Icon: Scale },
];

const ratingLabel = (avg) => {
  if (avg === 0) return "";
  if (avg < 2) return "Buruk";
  if (avg < 3) return "Kurang";
  if (avg < 4) return "Cukup";
  if (avg < 4.5) return "Baik";
  return "Sangat Baik";
};

export const Step2Rating = ({ form, lookupData, categories }) => {
  const { register, watch, setValue, trigger, formState: { errors } } = form;

  const ratings = watch("ratings") ?? {};
  const jobTitle = watch("jobTitle");
  const workScheme = watch("workScheme");
  const internshipType = watch("internshipType");
  const duration = watch("duration");
  const year = watch("year");
  const SubCategoryIds = watch("SubCategoryIds") || [];

  const ratingValues = [
    ratings.workCulture,
    ratings.learningOpp,
    ratings.mentorship,
    ratings.benefit,
    ratings.workLifeBalance,
  ].map((value) => Number(value) || 0);
  const avg = ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length;
  const avgLabel = avg > 0 ? avg.toFixed(1) : "0.0";

  const handleRatingChange = (categoryKey, rating) => {
    setValue(`ratings.${categoryKey}`, rating);
    trigger(`ratings.${categoryKey}`);
  };

  const allSubcategories = categories.flatMap((c) => c.subCategories ?? []);
  const schemeLabel = lookupData?.SCHEME?.find((o) => o.value === workScheme)?.label ?? workScheme;
  const typeLabel = lookupData?.INTERNSHIP_TYPE?.find((o) => o.value === internshipType)?.label ?? internshipType;

  const pills = [
    ...SubCategoryIds.map((id) => allSubcategories.find((s) => s.subCategoryId === id)?.subCategoryName).filter(Boolean),
    schemeLabel,
    typeLabel,
    duration && year ? `${duration} (${year})` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="border border-gray-200 rounded-lg p-4">
        <p className="font-semibold text-gray-900 mb-2">{jobTitle}</p>
        <div className="flex flex-wrap gap-2">
          {pills.map((pill, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full border border-gray-200 text-xs text-gray-600">{pill}</span>
          ))}
        </div>
      </div>

      {/* Rating Keseluruhan */}
      <div className="text-center -mt-1 py-1">
        <p className="text-base font-bold text-gray-900 mb-2">Rating Keseluruhan</p>
        <div className="flex justify-center mb-1.5">
          <StarRating
            rating={avg}
            size="lg"
            className="gap-1.5 [&>svg]:h-10 [&>svg]:w-10"
          />
        </div>
        <p className="text-sm font-semibold text-slate-700">{avgLabel} / 5</p>
        {avg > 0 && <p className="mt-1 text-sm font-semibold text-orange-500">{ratingLabel(avg)}</p>}
      </div>

      {/* Beri penilaian spesifik */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">
          Beri penilaian spesifik <span className="text-red-500">*</span>
        </p>
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
          {ratingCategories.map((cat) => (
            <div key={cat.key} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-50 border border-gray-100 flex-shrink-0">
                  <cat.Icon size={16} className="text-gray-500" />
                </div>
                <span className="text-sm text-gray-800">{cat.label}</span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(cat.key, star)}
                    className={`text-2xl leading-none transition-transform hover:scale-110 ${
                      star <= (ratings[cat.key] || 0) ? "text-[#F97316]" : "text-gray-200"
                    }`}
                    title={`${star} bintang`}
                  >★</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {errors.ratings && (
          <p className="text-red-500 text-xs mt-1">Semua penilaian wajib diisi</p>
        )}
      </div>

      {/* Testimony */}
      <div>
        <label htmlFor="testimony" className="block text-sm font-semibold text-gray-900 mb-2">
          Ceritakan pengalaman magangmu di sini... <span className="text-red-500">*</span>
        </label>
        <textarea
          id="testimony"
          {...register("testimony")}
          placeholder="Bagaimana pengalaman magang di sana? Apa yang kamu kerjakan dan bagaimana timnya?"
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
        />
        {errors.testimony && <p className="text-red-500 text-xs mt-1">{errors.testimony.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pros" className="block text-sm font-semibold text-gray-900 mb-2">
            Hal yang kamu sukai selama magang <span className="text-red-500">*</span>
          </label>
          <textarea
            id="pros"
            {...register("pros")}
            placeholder="Misal: Lingkungan yang kolaboratif..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
          />
          {errors.pros && <p className="text-red-500 text-xs mt-1">{errors.pros.message}</p>}
        </div>
        <div>
          <label htmlFor="cons" className="block text-sm font-semibold text-gray-900 mb-2">
            Tantangan saat magang berlangsung <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cons"
            {...register("cons")}
            placeholder="Misal: Kurangnya panduan awal..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
          />
          {errors.cons && <p className="text-red-500 text-xs mt-1">{errors.cons.message}</p>}
        </div>
      </div>
    </div>
  );
};
