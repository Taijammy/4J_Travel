import axios from "axios";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("driver_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem("driver_token");
    localStorage.removeItem("driver_user");
    window.location.href = "/auth";
  }
  return Promise.reject(err);
});
export default api;
