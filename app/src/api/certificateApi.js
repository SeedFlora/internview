import { axiosInstance } from "./axiosInstance";

export const getCertificateRequest = async (id) => {
  const response = await axiosInstance.get(`/user/certificate/request/${id}`);
  return response.data;
};

export const getCertificateVerificationList = async ({ search = "", status = "", cursor = null } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (status) params.status = status;
  if (cursor !== null) params.cursor = cursor;
  const response = await axiosInstance.get("/user/certificate/requests", { params });
  return response.data;
};

export const reviewCertificateRequest = async (id, { status, reviewNote = "" }) => {
  const response = await axiosInstance.patch(`/user/certificate/requests/${id}/review`, { 
    status,
    reviewNote 
  });
  return response.data;
};

