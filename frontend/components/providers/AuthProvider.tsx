"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiRequest,
  authTokenStorage,
  clearAuthSession,
  setUnauthorizedHandler,
  USER_SESSION_KEY,
} from "@/lib/api/client";

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshMe = async () => {
    const token = authTokenStorage.get();
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }
    // Trust local token and cached user to restore session on reload,
    // so login does not depend on a live /auth/me call.
    let cachedUser: AuthUser | null = null;
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(USER_SESSION_KEY);
      if (raw) {
        try {
          cachedUser = JSON.parse(raw) as AuthUser;
        } catch {
          cachedUser = null;
        }
      }
    }
    setUser(cachedUser);
    setIsAuthenticated(true);
    setLoading(false);
  };

  useEffect(() => {
    void refreshMe();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setIsAuthenticated(false);
      setUser(null);
      router.replace("/");
    });
    return () => setUnauthorizedHandler(null);
  }, [router]);

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
          const normalized: AuthUser = {
            ...result.user,
            id: result.user?.id != null ? String(result.user.id) : "",
          };
          setUser(normalized);
          setIsAuthenticated(true);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(normalized));
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
          const nextUser: AuthUser = {
            ...updated,
            id: updated?.id != null ? String(updated.id) : "",
          };
          setUser(nextUser);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(nextUser));
          }
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
        clearAuthSession();
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
