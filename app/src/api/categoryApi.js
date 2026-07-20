import { axiosInstance } from './axiosInstance';

export const getCategories = async (type = 'jobs') => {
  const response = await axiosInstance.get('/category', {
    params: { IncludeSubCategories: 1, type },
  });
  return response.data;
};

export const getTopCategories = async () => {
  const response = await axiosInstance.get('/top-categories');
  return response.data;
};

export const getSubCategorySummary = async (subCategoryName) => {
  const response = await axiosInstance.get(`/subcategory/${encodeURIComponent(subCategoryName)}/summary`);
  return response.data;
};

export const getSubCategoryMasterData = async ({ search = "", cursor = null, limit = 15 } = {}) => {
  const params = { limit };
  if (search) params.search = search;
  if (cursor !== null) params.cursor = cursor;
  const response = await axiosInstance.get("/admin/subcategory", { params });
  return response.data;
};

export const createCategory = async (payload) => {
  const response = await axiosInstance.post("/category", payload);
  return response.data;
};

export const updateCategory = async (categoryId, payload) => {
  const response = await axiosInstance.patch(`/category/${categoryId}`, payload);
  return response.data;
};

export const adminCreateSubCategory = async (payload) => {
  const response = await axiosInstance.post("/subcategory", payload);
  return response.data;
};

export const adminUpdateSubCategory = async (subCategoryId, payload) => {
  const response = await axiosInstance.patch(`/subcategory/${subCategoryId}`, payload);
  return response.data;
};