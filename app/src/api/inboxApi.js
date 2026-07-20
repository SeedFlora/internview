import { axiosInstance } from "./axiosInstance";

export const getInbox = async () => {
  const response = await axiosInstance.get("/inbox");
  return response.data;
};

// NOTE: markAsRead (PATCH /inbox/{id}/read) and deleteInbox (DELETE /inbox/{id})
// were removed -- the backend never implemented those routes, so they only
// returned 404. The inbox is currently read-only (GET /inbox). If an
// unread/delete feature is wanted, add the endpoints server-side first.
