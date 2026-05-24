import api from "@/lib/axios";
import { AuthResponse, ApiResponse } from "@/types";

export const authService = {
  register: async (data: {
    name: string; email: string; password: string; phone?: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", {
      ...data, role: "customer",
    });
    return res.data.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", { email, password });
    return res.data.data;
  },

  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data.data.user;
  },

  saveSession: (token: string, user: object) => {
    localStorage.setItem("cabride_token", token);
    localStorage.setItem("cabride_user",  JSON.stringify(user));
  },

  clearSession: () => {
    localStorage.removeItem("cabride_token");
    localStorage.removeItem("cabride_user");
  },

  getStoredUser: () => {
    const u = localStorage.getItem("cabride_user");
    return u ? JSON.parse(u) : null;
  },

  isLoggedIn: (): boolean => {
    return !!localStorage.getItem("cabride_token");
  },
};
