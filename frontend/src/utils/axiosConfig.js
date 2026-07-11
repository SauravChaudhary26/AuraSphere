// Compatibility shim — the real client now lives in src/lib/http.js.
export { default, api, API_BASE, getToken, setAuth, clearAuth } from "../lib/http";
