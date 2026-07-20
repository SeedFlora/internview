import { axiosInstance } from "./axiosInstance";

export const getDashboardStatistics = async () => {
  const response = await axiosInstance.get("/dashboard/statistics");
  return response.data;
};

export const getTopReviewsCompanies = async () => {
  const response = await axiosInstance.get("/dashboard/top-reviews");
  return response.data;
};

export const getDashboardTrends = async () => {
  const response = await axiosInstance.get("/dashboard/trends");
  return response.data;
};