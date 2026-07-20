import { axiosInstance } from "./axiosInstance";

export const getMajors = async () => {
  const response = await axiosInstance.get("/major/options");
  return response.data;
};