import { axiosInstance } from "./axiosInstance";

export const getRegions = async () => {
  const response = await axiosInstance.get("/region/options");
  return response.data;
};