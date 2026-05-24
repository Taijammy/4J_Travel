"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { User } from "@/types";

export const useAuth = () => {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = authService.getStoredUser();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authService.login(email, password);
    authService.saveSession(token, user);
    setUser(user);
    router.push("/dashboard");
  };

  const register = async (data: {
    name: string; email: string; password: string; phone?: string;
  }) => {
    const { token, user } = await authService.register(data);
    authService.saveSession(token, user);
    setUser(user);
    router.push("/dashboard");
  };

  const logout = () => {
    authService.clearSession();
    setUser(null);
    router.push("/auth");
  };

  return { user, loading, login, register, logout };
};
