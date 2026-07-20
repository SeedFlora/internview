import { useContext } from "react";
import { UserContext } from "@/context/userContext";

export function useAuth() {
  const { user, isAdmin, loadUser, logout, loading } = useContext(UserContext);

  return {
    user,
    isAdmin,
    loadUser,
    logout,
    loading,
    isAuthenticated: user !== null,
  };
}