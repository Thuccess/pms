"use client";

import React from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="sterling-ui-theme">
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
};
