import { useEffect, useState } from "react";

const EMPTY_FORM = {
	subCategoryName: "",
	categoryId: "",
};

export function SubcategoryFormModal({ modal, categories, onClose, onSave, submitting }) {
	const [form, setForm] = useState(EMPTY_FORM);

	useEffect(() => {
		if (!modal) return;

		if (modal.mode === "edit" && modal.data) {
			setForm({
				subCategoryName: modal.data.subCategoryName ?? "",
				categoryId: modal.data.categoryId ? String(modal.data.categoryId) : "",
			});
			return;
		}

		setForm({
			subCategoryName: "",
			categoryId: modal.data?.categoryId ? String(modal.data.categoryId) : "",
		});
	}, [modal]);

	if (!modal) return null;

	const handleChange = (field, value) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		onSave({
			subCategoryName: form.subCategoryName,
			categoryId: Number(form.categoryId),
		});
	};

	const isEdit = modal.mode === "edit";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div className="w-full max-w-md rounded-xl bg-white shadow-xl">
				<div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
					<h2 className="text-base font-semibold text-gray-900">
						{isEdit ? "Edit Subcategory" : "Add Subcategory"}
					</h2>
					<button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-gray-600">
						<span className="sr-only">Close</span>
						&times;
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
					<div>
						<label className="mb-1 block text-xs font-medium text-gray-700">Subcategory Name</label>
						<input
							required
							value={form.subCategoryName}
							onChange={(event) => handleChange("subCategoryName", event.target.value)}
							className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
							placeholder="e.g. Investment Banking"
						/>
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium text-gray-700">Category</label>
						<select
							required
							value={form.categoryId}
							onChange={(event) => handleChange("categoryId", event.target.value)}
							className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
						>
							<option value="">Select category</option>
							{categories.map((category) => (
								<option key={category.categoryId} value={category.categoryId}>
									{category.categoryName}
								</option>
							))}
						</select>
					</div>

					<div className="flex justify-end gap-2 pt-1">
						<button
							type="button"
							onClick={onClose}
							disabled={submitting}
							className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={submitting}
							className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
						>
							{submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Subcategory"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
