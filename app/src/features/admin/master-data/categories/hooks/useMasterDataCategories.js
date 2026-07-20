import { useState, useEffect, useCallback } from "react";
import {
	getCategories,
	createCategory,
	updateCategory,
	adminCreateSubCategory,
	adminUpdateSubCategory,
} from "@/api/categoryApi";
import { normalizeErrorMessage } from "@/helpers/apiUtils";

export function useMasterDataCategories() {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [type, setType] = useState("companies");
	const [expandedIds, setExpandedIds] = useState(new Set());
	const [categoryModal, setCategoryModal] = useState(null);
	const [subCategoryModal, setSubCategoryModal] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	const fetchCategories = useCallback(async () => {
		setLoading(true);
		try {
			const res = await getCategories(type);
			if (res.success) setCategories(res.result ?? []);
		} finally {
			setLoading(false);
		}
	}, [type]);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const toggleExpand = (categoryId) => {
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(categoryId)) {
				next.delete(categoryId);
			} else {
				next.add(categoryId);
			}
			return next;
		});
	};

	const openAddCategory = () => setCategoryModal({ mode: "add", data: { categoryType: type } });
	const openEditCategory = (category) =>
		setCategoryModal({
			mode: "edit",
			data: {
				categoryId: category.categoryId,
				categoryName: category.categoryName,
				categoryType: category.categoryType ?? type,
			},
		});
	const closeCategoryModal = () => setCategoryModal(null);

	const openAddSubCategory = (category) =>
		setSubCategoryModal({ mode: "add", data: { categoryId: category.categoryId } });
	const openEditSubCategory = (subCategory, categoryId) =>
		setSubCategoryModal({
			mode: "edit",
			data: {
				subCategoryId: subCategory.subCategoryId,
				subCategoryName: subCategory.subCategoryName,
				categoryId,
			},
		});
	const closeSubCategoryModal = () => setSubCategoryModal(null);

	const handleCategorySave = async (form) => {
		setSubmitting(true);
		try {
			if (categoryModal.mode === "edit") {
				await updateCategory(categoryModal.data.categoryId, form);
			} else {
				await createCategory(form);
			}
			closeCategoryModal();
			await fetchCategories();
		} catch (err) {
			alert(normalizeErrorMessage(err));
		} finally {
			setSubmitting(false);
		}
	};

	const handleSubCategorySave = async (form) => {
		setSubmitting(true);
		try {
			if (subCategoryModal.mode === "edit") {
				await adminUpdateSubCategory(subCategoryModal.data.subCategoryId, form);
			} else {
				await adminCreateSubCategory(form);
			}
			closeSubCategoryModal();
			await fetchCategories();
		} catch (err) {
			alert(normalizeErrorMessage(err));
		} finally {
			setSubmitting(false);
		}
	};

	return {
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
	};
}
