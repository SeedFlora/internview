import React, { useState, useEffect, useRef } from "react";
import { CalendarDays, BadgeCheck } from "lucide-react";
import { getJobOptions } from "@/api/reviewApi";

export const Step1InternshipInfo = ({ form, lookupData, categories, company }) => {
  const { register, watch, setValue, trigger, formState: { errors } } = form;
  const [jobQuery, setJobQuery] = useState(watch("jobTitle") || "");
  const [jobOptions, setJobOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const workScheme = watch("workScheme");
  const internshipType = watch("internshipType");
  const jobTitle = watch("jobTitle");
  const category = watch("category");
  const SubCategoryIds = watch("SubCategoryIds") || [];

  const handleJobSelect = (title) => {
    setValue("jobTitle", title);
    setValue("category", "");
    setValue("SubCategoryIds", []);
    trigger(["jobTitle", "category", "SubCategoryIds"]);
    setJobQuery(title);
    setShowDropdown(false);
  };

  const handleAddSubcategory = (id) => {
    const numId = Number(id);
    if (!numId || SubCategoryIds.length >= 4) return;
    if (SubCategoryIds.includes(numId)) return;
    const next = [...SubCategoryIds, numId];
    setValue("SubCategoryIds", next);
    trigger("SubCategoryIds");
  };

  const handleRemoveSubcategory = (id) => {
    setValue("SubCategoryIds", SubCategoryIds.filter((s) => s !== id));
    trigger("SubCategoryIds");
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value ? Number(e.target.value) : "";
    setValue("category", val);
    setValue("SubCategoryIds", []);
    trigger(["category", "SubCategoryIds"]);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (jobQuery.trim().length <= 3) { setJobOptions([]); return; }
      try {
        const res = await getJobOptions(jobQuery);
        setJobOptions((res.result || []).slice(0, 5));
      } catch {
        setJobOptions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [jobQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allSubcategories = categories.flatMap((c) => c.subCategories);

  return (
    <div className="space-y-6">
      {/* Company Info Card */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wide">Perusahaan</h3>
        <div className="flex items-center gap-4">
          {company?.companyLogo && (
            <img src={company.companyLogo} alt={company.companyName} className="w-16 h-16 object-contain" />
          )}
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-1">{company?.companyName}</p>
            <p className="text-sm text-gray-600">{company?.companyAbbreviation || ""}</p>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Sistem Kerja */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Sistem Kerja <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {(lookupData?.SCHEME ?? []).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setValue("workScheme", opt.value); trigger("workScheme"); }}
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                  workScheme === opt.value
                    ? "border-orange-400 bg-orange-50 text-orange-600"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.workScheme && <p className="text-red-500 text-xs mt-1">{errors.workScheme.message}</p>}
        </div>

        {/* Tipe Magang */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Tipe Magang <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {(lookupData?.INTERNSHIP_TYPE ?? []).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setValue("internshipType", opt.value); trigger("internshipType"); }}
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                  internshipType === opt.value
                    ? "border-orange-400 bg-orange-50 text-orange-600"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.internshipType && <p className="text-red-500 text-xs mt-1">{errors.internshipType.message}</p>}
        </div>

        {/* Posisi Magang */}
        <div ref={dropdownRef} className="relative">
          <label htmlFor="position" className="block text-sm font-semibold text-gray-900 mb-3">
            Posisi Magang <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="position"
            value={jobQuery}
            onChange={(e) => {
              const text = e.target.value;
              setJobQuery(text);
              setShowDropdown(true);
              setValue("jobTitle", text);
              setValue("category", "");
              setValue("SubCategoryIds", []);
              trigger("jobTitle");
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Contoh: Software Engineer Intern"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          />
          {showDropdown && jobOptions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-auto">
              {jobOptions.map((job, idx) => (
                <li
                  key={idx}
                  onClick={() => handleJobSelect(job.jobTitle)}
                  className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                >
                  {job.jobTitle}
                </li>
              ))}
            </ul>
          )}
          {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle.message}</p>}
        </div>

        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-3">
              Kategori Pekerjaan <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category || ""}
              onChange={handleCategoryChange}
              disabled={!jobTitle || SubCategoryIds.length >= 4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Sub Kategori <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-gray-400 font-normal">maks. 4</span>
            </label>
            <select
              value=""
              onChange={(e) => handleAddSubcategory(e.target.value)}
              disabled={!jobTitle || !category || SubCategoryIds.length >= 4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-sm text-gray-600"
            >
              <option value="">Pilih subkategori...</option>
              {(categories.find((c) => c.categoryId === category)?.subCategories ?? [])
                .filter((s) => !SubCategoryIds.includes(s.subCategoryId))
                .map((sub) => (
                  <option key={sub.subCategoryId} value={sub.subCategoryId}>{sub.subCategoryName}</option>
                ))}
            </select>
            {errors.SubCategoryIds && <p className="text-red-500 text-xs mt-1">{errors.SubCategoryIds.message}</p>}
          </div>
        </div>

        {SubCategoryIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {SubCategoryIds.map((id) => {
              const sub = allSubcategories.find((s) => s.subCategoryId === id);
              return (
                <span key={id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  {sub?.subCategoryName || id}
                  <button type="button" onClick={() => handleRemoveSubcategory(id)} className="ml-1 leading-none hover:opacity-70">×</button>
                </span>
              );
            })}
          </div>
        )}

        {/* Durasi & Tahun Magang */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="duration" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                Durasi Magang <span className="text-red-500">*</span>
              </label>
              <select
                id="duration"
                {...register("duration")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              >
                <option value="">Pilih durasi</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={`${month} bulan`}>{month} bulan</option>
                ))}
              </select>
              {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
            </div>

            <div>
              <label htmlFor="year" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <BadgeCheck className="h-4 w-4 text-gray-400" />
                Tahun Magang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="year"
                {...register("year")}
                placeholder="YYYY"
                maxLength="4"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
