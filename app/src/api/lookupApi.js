import { axiosInstance } from "./axiosInstance";

export const getLookups = async () => {
  const response = await axiosInstance.get("/lookup");
  return response.data;
};

export const getLookupsByType = async (type) => {
  const response = await axiosInstance.get(`/lookup/${type}`);
  return response.data;
};
