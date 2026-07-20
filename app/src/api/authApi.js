import { axiosInstance } from "./axiosInstance";
import { clearAuthSession } from "../utils/authUtils";

export const login = async (payload) => {
  const response = await axiosInstance.post("/auth/login", payload);
  return response.data;
};

export const register = async (payload) => {
  const response = await axiosInstance.post("/auth/register", payload);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async ({ token, newPassword }) => {
  const response = await axiosInstance.post("/auth/reset-password", { token, newPassword });
  return response.data;
};

export const logout = async () => {
  try {
    // Notify backend to invalidate session and clear server-side cookies
    await axiosInstance.post("/auth/logout");
  } catch (error) {
    console.error("Logout API call failed:", error.message);
    // Continue with client-side cleanup even if API call fails
  } finally {
    // Clear all authentication tokens and cookies
    clearAuthSession();
  }
};
