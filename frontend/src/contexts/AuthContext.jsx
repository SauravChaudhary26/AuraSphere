import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { getToken, setAuth, clearAuth } from "../lib/http";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = (payload = {}) => {
    setAuth({ token: payload.jwtToken, userId: payload.userId, name: payload.name });
    if (payload.user) setUser(payload.user);
    else hydrate();
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
