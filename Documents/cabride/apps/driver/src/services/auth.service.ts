import api from "@/lib/axios";

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data.data;
  },
  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.post("/auth/register", { ...data, role: "driver" });
    return res.data.data;
  },
  saveSession: (token: string, user: object) => {
    localStorage.setItem("driver_token", token);
    localStorage.setItem("driver_user",  JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem("driver_token");
    localStorage.removeItem("driver_user");
  },
  getStoredUser: () => {
    const u = localStorage.getItem("driver_user");
    return u ? JSON.parse(u) : null;
  },
  isLoggedIn: () => !!localStorage.getItem("driver_token"),
};
