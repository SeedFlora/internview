import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Container } from "@/components/layout/Container";
import { UnauthenticatedModal } from "@/components/common/UnauthenticatedModal";
import { createCompanyRequest } from "@/api/companyApi";
import { getCategories } from "@/api/categoryApi";

// Aligned with the backend CreateCompanyRequestRequest DTO so the client
// rejects the same inputs the server would (name min 3 not 2; website capped at
// 35 chars and abbreviation at 15). Previously a 44-char URL or a 2-char name
// passed here and came back as an opaque 400 from the API.
const schema = z.object({
  companyName: z.string().min(3, "Nama perusahaan minimal 3 karakter").max(65, "Nama perusahaan maksimal 65 karakter"),
  companyAbbreviation: z.string().min(1, "Singkatan perusahaan wajib diisi").max(15, "Singkatan maksimal 15 karakter"),
  website: z
    .string()
    .url("Format URL tidak valid (contoh: https://example.com)")
    .max(35, "Website maksimal 35 karakter"),
  isPartner: z.boolean(),
  bio: z.string().min(10, "Bio minimal 10 karakter").max(500, "Bio maksimal 500 karakter"),
  subcategoryId: z.coerce.number({ invalid_type_error: "Subkategori wajib dipilih" }).min(1, "Subkategori wajib dipilih"),
});

export const AddCompanyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const {
    register,
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: "",
      companyAbbreviation: "",
      website: "",
      isPartner: false,
      bio: "",
      subcategoryId: "",
    },
  });

  const isPartner = watch("isPartner");

  useEffect(() => {
    let cancelled = false;
    getCategories("companies").then((res) => {
      if (!cancelled && res.success) setCategories(res.result);
    });
    return () => { cancelled = true; };
  }, []);

  if (!isAuthenticated) {
    return <UnauthenticatedModal redirectPath={location.pathname} />;
  }

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await createCompanyRequest(data);
      toast.success("Submitted successfully.");
      navigate("/companies");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to submit request..";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.categoryId === Number(selectedCategoryId));
  const subcategories = selectedCategory?.subCategories ?? [];

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-slate-100 py-8 md:py-12">
        <Container>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Companies
          </button>

          <h1 className="mb-3 text-4xl font-semibold text-gray-900 md:text-5xl">
            Add New Company
          </h1>
          <p className="mb-6 max-w-2xl text-gray-600">
            Bantu mahasiswa lain dengan menambahkan informasi perusahaan. Pengajuan kamu akan diverifikasi sebelum dipublikasikan.
          </p>
        </Container>
      </section>

      <section className="bg-white py-8 md:py-10">
        <Container>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            {/* Section header */}
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Building2 size={20} className="text-amber-600" />
                <h2 className="font-plus-jakarta text-lg font-bold text-slate-900">Company Information</h2>
              </div>
              <p className="font-inter text-sm text-slate-500">Data dasar mengenai perusahaan yang ingin kamu tambahkan.</p>
            </div>

            <hr className="border-slate-100" />

            {/* Company Name + Abbreviation */}
            <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
              <div className="flex-[3]">
                <label htmlFor="companyName" className="mb-2 block text-sm font-semibold text-slate-900">
                  Nama Perusahaan <span className="text-red-500">*</span>
                </label>
                <input
                  id="companyName"
                  type="text"
                  {...register("companyName")}
                  placeholder="PT. Nama Perusahaan"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500"
                />
                {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
              </div>

              <div>
                <label htmlFor="companyAbbreviation" className="mb-2 block text-sm font-semibold text-slate-900">
                  Singkatan <span className="text-red-500">*</span>
                </label>
                <input
                  id="companyAbbreviation"
                  type="text"
                  {...register("companyAbbreviation")}
                  placeholder="CI"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500"
                />
                {errors.companyAbbreviation && <p className="text-red-500 text-xs mt-1">{errors.companyAbbreviation.message}</p>}
              </div>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="mb-2 block text-sm font-semibold text-slate-900">
                Website <span className="text-red-500">*</span>
              </label>
              <input
                id="website"
                type="url"
                {...register("website")}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500"
              />
              {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
            </div>

            {/* Category + Subcategory */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="categoryFilter" className="mb-2 block text-sm font-semibold text-slate-900">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoryFilter"
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setValue("subcategoryId", "");
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subcategoryId" className="mb-2 block text-sm font-semibold text-slate-900">
                  Subkategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="subcategoryId"
                  {...register("subcategoryId", {
                    onChange: () => trigger("subcategoryId"),
                  })}
                  disabled={!selectedCategoryId}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">Pilih subkategori</option>
                  {subcategories.map((sub) => (
                    <option key={sub.subCategoryId} value={sub.subCategoryId}>
                      {sub.subCategoryName}
                    </option>
                  ))}
                </select>
                {errors.subcategoryId && <p className="text-red-500 text-xs mt-1">{errors.subcategoryId.message}</p>}
              </div>
            </div>

            {/* Is Partner */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-900">
                BINUS Partner?
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Ya, Partner BINUS", value: true },
                  { label: "Bukan Partner", value: false },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setValue("isPartner", opt.value)}
                    className={`flex-1 cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                      isPartner === opt.value
                        ? "border-orange-400 bg-orange-50 text-orange-600"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="mb-2 block text-sm font-semibold text-slate-900">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                id="bio"
                {...register("bio")}
                placeholder="Ceritakan sedikit tentang perusahaan ini..."
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-orange-500"
              />
              {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
            </div>

            <hr className="border-slate-100" />

            {/* Footer actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl border border-slate-200 px-8 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-36"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
            </div>
          </form>
        </Container>
      </section>
    </div>
  );
};
