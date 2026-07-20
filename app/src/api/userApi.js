import { axiosInstance } from "./axiosInstance";

export const updateProfile = async (payload) => {
  // PATCH /user/me — updates editable personal info (firstName, lastName,
  // phoneNumber). Email and academic data are not editable here.
  const response = await axiosInstance.patch("/user/me", payload);
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get("/user/me");
  return response.data;
};

export const checkEmail = async (email) => {
  const response = await axiosInstance.post("/user/check-email", { email });
  return response.data;
};

export const submitCertificate = async (certificateData) => {
  const response = await axiosInstance.post("/user/certificate", certificateData);
  return response.data;
};

export const getMyCertificates = async () => {
  const response = await axiosInstance.get("/user/my-certificates");
  return response.data;
};

export const getMyReviews = async (cursor = null, limit = 10) => {
  const params = { limit };
  if (cursor !== null) {
    params.cursor = cursor;
  }

  const response = await axiosInstance.get("/user/my-reviews", { params });
  return response.data;
};

export const getSavedCompanies = async (cursor = null, limit = 20) => {
  const params = { limit };
  if (cursor !== null) {
    params.cursor = cursor;
  }

  const response = await axiosInstance.get("/user/my-bookmarks", { params });
  return response.data;
};

export const getAllUsers = async ({ cursor = null, limit = 15, search = "" } = {}) => {
  const params = { limit };
  if (cursor !== null) {
    params.cursor = cursor;
  }
  if (search) {
    params.search = search;
  }

  const response = await axiosInstance.get("/user/all-user", { params });
  return response.data;
};

export const setUserAsAdmin = async (userId) => {
  try {
    const response = await axiosInstance.patch(`/user/set-admin/${userId}`);
    return response.data;
  } catch (error) {
    // Fallback in case backend exposes this endpoint with POST instead of PATCH.
    if (error?.response?.status === 404 || error?.response?.status === 405) {
      const response = await axiosInstance.post(`/user/set-admin/${userId}`);
      return response.data;
    }
    throw error;
  }
};
