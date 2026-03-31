"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/layouts/AppShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { ROUTES } from "@/constants/routes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(ROUTES.home);
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }

  return <AppShell>{children}</AppShell>;
}
