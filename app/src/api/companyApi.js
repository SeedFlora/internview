
import { axiosInstance } from "./axiosInstance";

export const getCompanyRequest = async (requestId) => {
  const response = await axiosInstance.get(`/company/request/${requestId}`);
  return response.data;
};

// BUG FIX: these called PATCH /company/request/{id}/approve|reject, which the
// backend never exposed (404). The real endpoint is the single review endpoint
// below, distinguished by a status field. Delegate to it so the inbox
// approve/reject actions actually work.
export const approveCompanyRequest = async (requestId, reviewNote = "") =>
  reviewCompanyRequest(requestId, { status: "APPROVED", reviewNote });

export const rejectCompanyRequest = async (requestId, reviewNote = "") =>
  reviewCompanyRequest(requestId, { status: "REJECTED", reviewNote });

export const getCompanies = async (cursor = null, limit = 15, sort = "all") => {
  const params = { limit };
  if (cursor !== null) {
    params.cursor = cursor;
  }
  if (sort && sort !== "all") {
    params.sort = sort;
  }
  const response = await axiosInstance.get("/company", { params });
  return response.data;
};

export const searchCompanies = async (query) => {
  const response = await axiosInstance.get("/company", {
    params: { search: query }
  });
  return response.data;
};

export const getCompanyBySlug = async (slug) => {
  const response = await axiosInstance.get(`/company/${slug}`);
  return response.data;
};

export const saveCompany = async (companySlug, isSave = true) => {
  const response = await axiosInstance.post(`/company/${companySlug}/save`, {
    isSave,
  });
  return response.data;
};

export const unsaveCompany = async (companySlug) => {
  return saveCompany(companySlug, false);
};

export const getCompaniesBySubcategory = async (subCategoryName, type, cursor = null, limit = 20) => {
  const params = { type, limit };
  if (cursor !== null && cursor !== undefined) {
    params.cursor = cursor;
  }

  const response = await axiosInstance.get(`/subcategory/${encodeURIComponent(subCategoryName)}/companies`, {
    params
  });
  return response.data;
};

export const getTopRatedCompanies = async () => {
  const response = await axiosInstance.get('/company/top-ratings');
  return response.data;
};

export const createCompanyRequest = async (payload) => {
  const response = await axiosInstance.post('/company/requests', payload);
  return response.data;
};

export const getCompanyRequests = async ({ search = "", status = "", cursor = null } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (status) params.status = status;
  if (cursor !== null) params.cursor = cursor;
  const response = await axiosInstance.get('/company/requests', { params });
  return response.data;
};

export const reviewCompanyRequest = async (requestId, { status, reviewNote = "" }) => {
  const response = await axiosInstance.patch(`/company/requests/${requestId}/review`, {
    status,
    reviewNote,
  });
  return response.data;
};

export const getCompanyMasterData = async ({ search = "", cursor = null, limit = 15 } = {}) => {
  const params = { limit };
  if (search) params.search = search;
  if (cursor !== null) params.cursor = cursor;
  const response = await axiosInstance.get("/company/master-data", { params });
  return response.data;
};

export const adminCreateCompany = async (payload) => {
  const response = await axiosInstance.post("/company/create", payload);
  return response.data;
};

export const adminUpdateCompany = async (companyId, payload) => {
  const { companyName, companyAbbreviation, bio, website, subcategoryId, isPartner } = payload;
  const response = await axiosInstance.patch(`/company/${companyId}`, {
    companyName,
    companyAbbreviation,
    bio,
    website,
    subcategoryId,
    isPartner,
  });
  return response.data;
};

// BUG FIX: called DELETE /admin/company/{id} (404 - no such route). The backend
// admin company endpoints live under /company (create at /company/create,
// update at PATCH /company/{id}); delete is DELETE /company/{id}.
export const adminDeleteCompany = async (companyId) => {
  const response = await axiosInstance.delete(`/company/${companyId}`);
  return response.data;
};