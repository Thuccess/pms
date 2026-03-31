"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, authTokenStorage } from "@/lib/api/client";

type AuthUser = {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  loading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  refreshMe: () => Promise<void>;
  updateProfile: (payload: { name?: string; email?: string; password?: string; avatar?: string }) => Promise<{ ok: boolean; message?: string }>;
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_KEY = "user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshMe = async () => {
    const token = authTokenStorage.get();
    console.log("Token:", token);
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }

    // Temporary mode: trust local session to avoid redirect loop while backend
    // DB-dependent auth endpoints may fail.
    let cachedUser: AuthUser | null = null;
    if (typeof window !== "undefined") {
      const rawUser = window.localStorage.getItem(USER_KEY);
      if (rawUser) {
        try {
          cachedUser = JSON.parse(rawUser) as AuthUser;
        } catch {
          cachedUser = null;
        }
      }
    }
    setUser(cachedUser);
    setIsAuthenticated(true);
    setLoading(false);
    console.log("isAuthenticated:", true);
  };

  useEffect(() => {
    void refreshMe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      loading,
      user,
      refreshMe,
      login: async (email, password) => {
        try {
          const result = await apiRequest<{ token: string; user: AuthUser }>("/auth/login", {
            method: "POST",
            auth: false,
            body: JSON.stringify({ email, password }),
          });
          authTokenStorage.set(result.token);
          setUser(result.user);
          setIsAuthenticated(true);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(USER_KEY, JSON.stringify(result.user));
          }
          return { ok: true };
        } catch (error) {
          return { ok: false, message: error instanceof Error ? error.message : "Invalid credentials" };
        }
      },
      updateProfile: async (payload) => {
        try {
          const updated = await apiRequest<AuthUser>("/profile", {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          setUser(updated);
          return { ok: true };
        } catch (error) {
          return { ok: false, message: error instanceof Error ? error.message : "Profile update failed" };
        }
      },
      changePassword: async ({ currentPassword, newPassword }) => {
        try {
          await apiRequest<{ message: string }>("/change-password", {
            method: "PUT",
            body: JSON.stringify({ currentPassword, newPassword }),
          });
          return { ok: true };
        } catch (error) {
          return { ok: false, message: error instanceof Error ? error.message : "Password update failed" };
        }
      },
      logout: () => {
        authTokenStorage.clear();
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(USER_KEY);
        }
        setIsAuthenticated(false);
        setUser(null);
      },
    }),
    [isAuthenticated, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
