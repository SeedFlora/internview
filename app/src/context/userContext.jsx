import { createContext, useState, useEffect, useRef } from "react";
import { getMe } from "@/api/userApi";
import { logout as apiLogout } from "@/api/authApi";

export const UserContext = createContext({
  user: null,
  isAdmin: false,
  loadUser: async () => {},
  logout: async () => {},
  loading: false
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Start with true to prevent flash
  const isFetching = useRef(false);

  const loadUser = async (force = false) => {
    setLoading(true); // Always set loading when starting
    
    // Check localStorage first (unless force refresh)
    if (!force) {
      const cachedUser = localStorage.getItem("userProfile");
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          setAdmin(userData?.role === "admin");
          setLoading(false); // Done loading from cache
          console.info("User profile loaded from localStorage cache");
          return;
        } catch (err) {
          // Invalid cache, remove it
          localStorage.removeItem("userProfile");
          console.warn("Invalid user cache, removed from localStorage");
        }
      }
    }

    // Prevent concurrent API calls
    if (isFetching.current) {
      return;
    }

    try {
      isFetching.current = true;
      setLoading(true);
      console.info("Fetching user profile from API...");
      const res = await getMe();
      const data = res;

      if (data.success) {
        setUser(data.result);
        setAdmin(data.result?.role === "admin");
        // Save to localStorage
        localStorage.setItem("userProfile", JSON.stringify(data.result));
        console.info("User profile fetched from API and saved to cache");
      } else {
        setUser(null);
        localStorage.removeItem("userProfile");
        console.error("Failed to fetch user profile from API");
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem("userProfile");
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const logout = async () => {
    setUser(null);
    isFetching.current = false;
    // Call API logout which handles clearing cookies and localStorage
    await apiLogout();
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false); // No token, not loading
      return;
    }

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isAdmin: admin, loadUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}