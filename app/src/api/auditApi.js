import { axiosInstance } from "./axiosInstance";

export const getAuditLog = async (entity, id) => {
  const response = await axiosInstance.get(`/audit`, {
    params: {
      entity,
      id
    }
  });
  return response.data;
};
