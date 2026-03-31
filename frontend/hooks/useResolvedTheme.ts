"use client";

import { useMemo } from "react";
import { useTheme } from "@/components/ThemeProvider";

export function useResolvedTheme() {
  const { theme } = useTheme();

  return useMemo(() => {
    if (theme === "system") {
      if (typeof window === "undefined") return "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme;
  }, [theme]);
}
