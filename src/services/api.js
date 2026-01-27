import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Proxy all requests to Netlify redirects
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
    console.log('[API] Request with auth token:', cfg.method.toUpperCase(), cfg.url);
  } else {
    console.warn('[API] No auth token found in localStorage');
  }
  console.log('[API] Request:', cfg.method.toUpperCase(), cfg.url, cfg.params);
  return cfg;
});

api.interceptors.response.use(
  (response) => {
    console.log('[API] Response success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error.response?.status, error.config?.url, error.message);
    console.error('[API] Error details:', error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
