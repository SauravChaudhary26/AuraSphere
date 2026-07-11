// Compatibility shim — global axios is now configured in src/lib/http.js.
import "../lib/http";
import axios from "axios";

// Kept as no-ops so any legacy imports keep working; the request interceptor
// attaches the token automatically on every request now.
export const updateAuthHeader = () => {};
export const clearAuthHeader = () => {};

export default axios;
