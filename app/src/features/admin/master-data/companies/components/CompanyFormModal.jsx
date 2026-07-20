import { useEffect, useState } from "react";
import { X } from "lucide-react";

const EMPTY_FORM = {
  companyName: "",
  companyAbbreviation: "",
  website: "",
  subcategoryId: "",
  bio: "",
  isPartner: false,
};

export function CompanyFormModal({ modal, categories, onClose, onSave, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  useEffect(() => {
    if (!modal) return;
    if (modal.mode === "edit" && modal.data) {
      setForm({
        companyName: modal.data.companyName ?? "",
        companyAbbreviation: modal.data.companyAbbreviation ?? "",
        website: modal.data.website ?? "",
        subcategoryId: modal.data.subcategoryId ?? "",
        bio: modal.data.bio ?? "",
        isPartner: modal.data.isPartner ?? false,
      });
      const parentCategory = categories.find((c) =>
        c.subCategories?.some((s) => s.subCategoryId === modal.data.subcategoryId)
      );
      setSelectedCategoryId(parentCategory?.categoryId ?? "");
    } else {
      setForm(EMPTY_FORM);
      setSelectedCategoryId("");
    }
  }, [modal, categories]);

  if (!modal) return null;

  const selectedCategory = categories.find((c) => c.categoryId === Number(selectedCategoryId));
  const subcategories = selectedCategory?.subCategories ?? [];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategoryId(catId);
    setForm((prev) => ({ ...prev, subcategoryId: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const isEdit = modal.mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Edit Company" : "Add Company"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700">Company Name</label>
              <input
                required
                value={form.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                placeholder="PT Example Indonesia"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Abbreviation</label>
              <input
                required
                value={form.companyAbbreviation}
                onChange={(e) => handleChange("companyAbbreviation", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                placeholder="EXI"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Subcategory</label>
              <select
                required
                value={form.subcategoryId}
                onChange={(e) => handleChange("subcategoryId", e.target.value)}
                disabled={subcategories.length === 0}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 disabled:opacity-50"
              >
                <option value="">Select subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub.subCategoryId} value={sub.subCategoryId}>
                    {sub.subCategoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700">Website</label>
              <input
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                placeholder="https://example.com"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                placeholder="Brief description of the company..."
              />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <input
                id="isPartner"
                type="checkbox"
                checked={form.isPartner}
                onChange={(e) => handleChange("isPartner", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-orange-500"
              />
              <label htmlFor="isPartner" className="text-sm text-gray-700">
                BINUS Partner Company
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
