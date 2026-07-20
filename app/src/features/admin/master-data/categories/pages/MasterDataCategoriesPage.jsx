import { Pencil, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { useMasterDataCategories } from "../hooks/useMasterDataCategories";
import { CategoryFormModal, SubcategoryFormModal } from "../components";

export function MasterDataCategoriesPage() {
	const {
		categories,
		loading,
		type,
		setType,
		expandedIds,
		toggleExpand,
		categoryModal,
		subCategoryModal,
		submitting,
		openAddCategory,
		openEditCategory,
		closeCategoryModal,
		openAddSubCategory,
		openEditSubCategory,
		closeSubCategoryModal,
		handleCategorySave,
		handleSubCategorySave,
	} = useMasterDataCategories();

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Master Data - Categories</h1>
					<p className="mt-1 text-sm text-gray-500">Manage category records grouped by type</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 text-sm">
						<button
							onClick={() => setType("companies")}
							className={`rounded-md px-3 py-1.5 font-medium transition ${type === "companies" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
						>
							Companies
						</button>
						<button
							onClick={() => setType("jobs")}
							className={`rounded-md px-3 py-1.5 font-medium transition ${type === "jobs" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
						>
							Jobs
						</button>
					</div>
					<button
						onClick={openAddCategory}
						className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
					>
						<Plus size={16} />
						Add Category
					</button>
				</div>
			</div>

			{loading ? (
				<div className="flex justify-center py-16">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
				</div>
			) : categories.length === 0 ? (
				<div className="rounded-xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-400 shadow-sm">
					No categories found.
				</div>
			) : (
				<div className="space-y-4">
					{categories.map((category) => {
						const isExpanded = expandedIds.has(category.categoryId);

						return (
							<div key={category.categoryId} className="rounded-xl border border-gray-100 bg-white shadow-sm">
								<div className="flex items-center justify-between rounded-xl px-4 py-3">
									<button
										onClick={() => toggleExpand(category.categoryId)}
										className="flex min-w-0 items-center gap-2 text-left transition hover:text-gray-700"
									>
										{isExpanded ? (
											<ChevronDown size={16} className="shrink-0 text-gray-400" />
										) : (
											<ChevronRight size={16} className="shrink-0 text-gray-400" />
										)}
										<span className="truncate text-sm font-semibold text-gray-900">{category.categoryName}</span>
										<span className="text-xs text-gray-400">
											{category.subCategories?.length ?? 0} sub-categories
										</span>
									</button>
									<div className="flex items-center gap-1">
										<button
											onClick={() => openAddSubCategory(category)}
											className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
											title="Add subcategory"
										>
											<Plus size={13} />
											Add Subcategory
										</button>
										<button
											onClick={() => openEditCategory(category)}
											className="rounded p-1 text-blue-500 transition hover:bg-blue-50"
											title="Edit category"
										>
											<Pencil size={14} />
										</button>
									</div>
								</div>

								{isExpanded && (
									<div className="border-t border-gray-100">
										<table className="w-full text-sm">
											<thead>
												<tr className="border-b border-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
													<th className="px-4 py-2">Sub Category Name</th>
													<th className="w-16 px-4 py-2 text-right">Actions</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-50">
												{!category.subCategories || category.subCategories.length === 0 ? (
													<tr>
														<td colSpan={2} className="px-4 py-6 text-center text-xs text-gray-300">
															No sub-categories yet.
														</td>
													</tr>
												) : (
													category.subCategories.map((subCategory) => (
														<tr key={subCategory.subCategoryId} className="hover:bg-gray-50">
															<td className="px-4 py-3 text-gray-700">{subCategory.subCategoryName}</td>
															<td className="px-4 py-3">
																<div className="flex items-center justify-end gap-1">
																	<button
																		onClick={() => openEditSubCategory(subCategory, category.categoryId)}
																		className="rounded p-1 text-blue-500 transition hover:bg-blue-50"
																		title="Edit subcategory"
																	>
																		<Pencil size={14} />
																	</button>
																</div>
															</td>
														</tr>
													))
												)}
											</tbody>
										</table>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			<CategoryFormModal
				modal={categoryModal}
				activeType={type}
				onClose={closeCategoryModal}
				onSave={handleCategorySave}
				submitting={submitting}
			/>

			<SubcategoryFormModal
				modal={subCategoryModal}
				categories={categories}
				onClose={closeSubCategoryModal}
				onSave={handleSubCategorySave}
				submitting={submitting}
			/>
		</div>
	);
}
