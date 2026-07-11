import axios from "axios";

// Single source of truth for the API base URL (was hardcoded in two files).
export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export const api = axios.create({ baseURL: API_BASE });

export const getToken = () => localStorage.getItem("token");

export const setAuth = ({ token, userId, name } = {}) => {
  if (token) localStorage.setItem("token", token);
  if (userId) localStorage.setItem("userId", userId);
  if (name) localStorage.setItem("loggedInUser", name);
};

export const clearAuth = () => {
  ["token", "userId", "loggedInUser"].forEach((k) => localStorage.removeItem(k));
};

// Attach the bearer token on EVERY request (read fresh — this is the fix for
// the dashboard 401 that used to require a hard refresh after login).
const attachToken = (config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

let redirecting = false;
const AUTH_PATHS = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
const handle401 = (error) => {
  if (error?.response?.status === 401 && !redirecting) {
    clearAuth();
    if (!AUTH_PATHS.includes(window.location.pathname)) {
      redirecting = true;
      window.location.assign("/login");
    }
  }
  return Promise.reject(error);
};

api.interceptors.request.use(attachToken);
api.interceptors.response.use((r) => r, handle401);

// Configure the global axios too, so legacy pages still importing `axios`
// directly pick up the base URL, token, and 401 handling during the migration.
axios.defaults.baseURL = API_BASE;
axios.interceptors.request.use(attachToken);
axios.interceptors.response.use((r) => r, handle401);

export default api;
