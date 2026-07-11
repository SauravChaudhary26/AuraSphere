import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { getToken, setAuth, clearAuth } from "../lib/http";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Build a minimal user from what we always have in localStorage, so a valid
// token means "authenticated" even before /auth/me responds.
const minimalUser = () => {
  const id = localStorage.getItem("userId");
  const name = localStorage.getItem("loggedInUser");
  return id || name ? { id, name } : { name: "Student" };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    // Optimistically authenticate from the token; enrich (or revoke) below.
    setUser((u) => u || minimalUser());
    try {
      const { data } = await api.get("/auth/me");
      if (data?.user) setUser(data.user);
    } catch (err) {
      // Only a real 401 means the token is invalid/expired — then log out.
      // A 404 / network / 5xx (e.g. backend not yet redeployed, cold start)
      // must NOT wipe a valid session.
      if (err?.response?.status === 401) {
        clearAuth();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = (payload = {}) => {
    setAuth({ token: payload.jwtToken, userId: payload.userId, name: payload.name });
    // Authenticate synchronously so navigation to protected routes succeeds
    // immediately, regardless of whether the login response included `user`.
    setUser(payload.user || minimalUser());
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refresh: hydrate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
