import { axiosInstance } from "./axiosInstance";

export const getInbox = async () => {
  const response = await axiosInstance.get("/inbox");
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axiosInstance.get("/inbox/unread-count");
  return response.data;
};

export const markInboxRead = async (inboxId) => {
  const response = await axiosInstance.patch(`/inbox/${inboxId}/read`);
  return response.data;
};

export const markAllInboxRead = async () => {
  const response = await axiosInstance.patch("/inbox/read-all");
  return response.data;
};
